import React, { useEffect, useState } from "react";
import { notify } from "../../utils/toastService";
import ConfirmationModal from "../../components/ui/Modal/ConfirmationModal";
import AdminModal from "../../components/ui/Modal/AdminModal";
import ReusableTable from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";

import { notificationService } from "../../services/notification.service";
import type {
  NotificationScope,
  NotificationCategory,
  NotificationSendAs,
  UserRole
} from "../../types/notification.type";
import UserSearchSelect from "../../components/user/UserSearchSelect";
import TextAreaSection from "../../components/ui/TextAreaSection";
import SearchFilter from "../../components/admin/SearchFilter";
import Loader from "../../components/ui/Loader/Loader";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const notificationFields: {
  name: keyof NotificationForm;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  {
    name: 'subject',
    label: 'Subject',
    placeholder: 'Enter notification subject',
  },
];


const notificationDropdowns: {
  name: keyof NotificationForm;
  label: string;
  options: string[];
}[] = [
  {
    name: 'scope',
    label: 'Scope',
    options: ['global', 'role', 'users'],
  },
  {
    name: 'category',
    label: 'Category',
    options: [
      'job_posted',
      'proposal_received',
      'proposal_accepted',
      'payment',
      'admin_announcement',
      'system',
    ],
  },
  {
    name: 'sendAs',
    label: 'Send As',
    options: ['in-app', 'email', 'both'],
  },
  {
    name: 'roles',
    label: 'Roles',
    options: ['client', 'freelancer', 'admin']
  },
];


interface AdminNotification {
  id: string;
  scope: NotificationScope;
  roles?: UserRole[];
  userIds?: string[];
  category: NotificationCategory;
  subject: string;
  message: string;
  sendAs: NotificationSendAs;
  createdAt: string;
}

type NotificationForm = {
  scope: NotificationScope;
  roles: UserRole[];
  userIds: string[];
  category: NotificationCategory;
  subject: string;
  message: string;
  sendAs: NotificationSendAs;
};

const initialForm: NotificationForm = {
  scope: "global",
  roles: [],
  userIds: [],
  category: "admin_announcement",
  subject: "",
  message: "",
  sendAs: "in-app",
};

const AdminNotificationsPage: React.FC = () => {

  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.subject.trim()) e.subject = "Subject is required";
    if (!formData.message.trim()) e.message = "Message is required";

    if (formData.scope === "role" && formData.roles.length === 0) {
      e.roles = "At least one role is required";
    }

    if (formData.scope === "users" && formData.userIds.length === 0) {
      e.userIds = "At least one user is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAdminNotifications(search, page, limit);
      setNotifications(res.data.notifications.data);
      setTotalPages(res.data.notifications.totalPages);
    } catch(error: any) {
      notify.error(error.response?.data?.error || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchNotifications();
    }, 300);

    return () => clearTimeout(delay);
  }, [search, page]);

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      scope: formData.scope,
      category: formData.category,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      sendAs: formData.sendAs,
      roles: formData.scope === "role" ? formData.roles : undefined,
      userIds: formData.scope === "users" ? formData.userIds : undefined,
    };

    setLoading(true);
    try {
      if (editingId) {
        await notificationService.updateNotification(editingId, payload);
        notify.success("Notification updated");
      } else {
        await notificationService.createNotification(payload);
        notify.success("Notification sent");
      }

      resetForm();
      fetchNotifications();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to save notification");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: AdminNotification) => {
    setEditingId(row.id);
    setFormData({
      scope: row.scope,
      roles: row.roles || [],
      userIds: row.userIds || [],
      category: row.category,
      subject: row.subject,
      message: row.message,
      sendAs: row.sendAs,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await notificationService.deleteNotification(deleteId);
      notify.success("Notification deleted");
      fetchNotifications();
    } catch {
      notify.error("Failed to delete notification");
    } finally {
      setConfirmModal(false);
      setDeleteId(null);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(false);
  };

  const effectiveDropdowns = notificationDropdowns.filter(d => {
    if (d.name === 'roles') return formData.scope === 'role';
    if (d.name === 'userIds') return formData.scope === 'users';
    return true;
  });

  const columns: Column<AdminNotification>[] = [
    { key: "subject", header: "Subject" },
    { key: "message", header: "Message", render: (val: string) => (
        <div className="flex justify-center">
          <div className="max-w-xs break-words whitespace-normal text-center">
            {val}
          </div>
        </div>
      )
    },
    { key: "category", header: "Category" },
    { key: "scope", header: "Scope" },
    { key: "sendAs", header: "Send As" },
    {
      key: "id",
      header: "Actions",
      render: (_: any, row: AdminNotification) => (
        <>
            <div className="gap-2">
                <Button label='Edit' onClick={() => handleEdit(row)}
                className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-transparent dark:bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"/>
                <Button label='Delete' onClick={() => {
                    setDeleteId(row.id);
                    setConfirmModal(true);
                }}
                className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border bg-transparent dark:bg-transparent border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900"/>
            </div>
        </>
      ),
    },
  ];

  return (
    <>
    { loading && <Loader/> }

      <ConfirmationModal
        isOpen={confirmModal}
        title="Confirm Delete"
        description="Are you sure you want to delete this notification?"
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleDelete}
      />
      {/* modal to create and update notification */}
        <AdminModal
            isOpen={isModalOpen}
            title={editingId ? 'Edit Notification' : 'Create Notification'}
            onClose={resetForm}
            onSubmit={handleSubmit}
            formData={formData}
            fields={notificationFields}
            dropdowns={effectiveDropdowns}
            errors={errors}
            onChange={(field, value) =>
                setFormData(prev => ({ ...prev, [field]: value }))
            }
        >
          <TextAreaSection
            label="Message"
            placeholder="Enter notification message"
            name="message"
            value={formData.message}
            error={errors.message}
            onChange={(field, value) =>
                  setFormData(prev => ({ ...prev, [field]: value }))
            }
          />

            {formData.scope === "users" && (
                <UserSearchSelect
                value={formData.userIds}
                onChange={(ids) =>
                    setFormData(prev => ({ ...prev, userIds: ids }))
                }
                />
            )}
        </AdminModal>

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Notification Management
            </h1>
            <Button label='+ Create Notification' onClick={() => setModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-600 rounded hover:bg-indigo-700 dark:hover:bg-indigo-700"/>
        </div>

            <SearchFilter
              search={search}
              onSearchChange={setSearch}
            />

        <ReusableTable
          title="Notifications"
          columns={columns}
          data={notifications}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default AdminNotificationsPage;