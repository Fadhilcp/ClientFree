import SettingSection from "../../../components/user/settings/SettingSection";
import InputSection from "../../../components/ui/InputSection";
import Button from "../../../components/ui/Button";
import { useState } from "react";
import { validateConfirmPassword, validatePassword } from "../../../utils/validators";
import { authService } from "../../../services/auth.service";
import { notify } from "../../../utils/toastService";
import Loader from "../../../components/ui/Loader/Loader";

export type ChangePasswordType = {password: string, newPassword: string, confirmPassword: string}

const SecuritySetting = () => {
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<ChangePasswordType>({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field : keyof typeof values, value : string) => {
    setValues((prev) => ({
      ...prev,
      [field] : value
    }))
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAll = () => {
    const newErrors : Record<string, string> = {
      password : values.password === '' ? 'Password is required' : '',
      newPassword : validatePassword(values.newPassword),
      confirmPassword : validateConfirmPassword(values.newPassword,values.confirmPassword)
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === '')
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if(!validateAll()) return;
    setLoading(true);
    try {
      const response = await authService.changePassword(values);
      notify.success(response.data.message ||'Password changed successfully');
      setValues({password: '', newPassword: '', confirmPassword: ''});
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Password changing failed');
    } finally {
      setLoading(false);
    }
  };

return (
  <>
  { loading && <Loader/> }
    <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-500">Account & Security</h1>

    <SettingSection
      title="Change Password"
      description="Update your password to keep your account safe."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputSection<typeof values>
          label="Current Password"
          type="password"
          name="password"
          placeholder="Enter current password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          className="w-full px-3 py-3 rounded-lg font-medium
          bg-gray-100 dark:bg-gray-800
          placeholder-gray-500 dark:placeholder-gray-400
          text-sm text-gray-900 dark:text-gray-100
          focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
          focus:bg-white dark:focus:bg-gray-700"
        />
        <InputSection<typeof values>
          label="New Password"
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          value={values.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          className="w-full px-3 py-3 rounded-lg font-medium
          bg-gray-100 dark:bg-gray-800
          placeholder-gray-500 dark:placeholder-gray-400
          text-sm text-gray-900 dark:text-gray-100
          focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
          focus:bg-white dark:focus:bg-gray-700"
        />
        <InputSection<typeof values>
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          className="w-full px-3 py-3 rounded-lg font-medium
          bg-gray-100 dark:bg-gray-800
          placeholder-gray-500 dark:placeholder-gray-400
          text-sm text-gray-900 dark:text-gray-100
          focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
          focus:bg-white dark:focus:bg-gray-700"
        />
        <div className="flex justify-end">
          <Button type="submit" label="Update Password" className="py-1 px-2 text-sm rounded-sm" />
        </div>

      </form>
    </SettingSection>
  </>
);
};

export default SecuritySetting;