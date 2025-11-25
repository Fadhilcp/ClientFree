import jobAssignmentModel from "models/jobAssignment.model";
import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IJobAssignmentRepository } from "./interfaces/IJobAssignmentRepository";
import { BaseRepository } from "./base.repository";

export class JobAssignmentRepository 
    extends BaseRepository<IJobAssignmentDocument> 
        implements IJobAssignmentRepository {

        constructor(){
            super(jobAssignmentModel)
        }
}