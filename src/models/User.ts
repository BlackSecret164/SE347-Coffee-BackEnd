import { Staff } from "src/entities/staff.entity";
export class UserModal{
    id: number;
    name: string;
    gender: string;
    birth: Date;
    address: string;
    phone: string;
    workshifId: number;
    workHours: number;
    salary: number;
    minsalary: number;
    typeStaff: string;
    startDate: Date;
    activeStatus: boolean;
    password: string;
    roleId: number;
    role: string; // ADMIN_SYSTEM | ADMIN_BRAND | STAFF
    branchId: number;

    constructor(user:Staff){
        this.id = user.id;
        this.name = user.name;
        this.gender = user.gender;
        this.birth = user.birth;
        this.address = user.address;
        this.phone = user.phone;
        this.workshifId = user.workshifId;
        this.workHours = user.workHours;
        this.salary = user.salary;
        this.minsalary = user.minsalary;
        this.typeStaff = user.typeStaff;
        this.startDate = user.startDate;
        this.activeStatus = user.activeStatus;
        this.password = user.password;
        this.roleId = user.roleId;
        this.role = user.role;
        this.branchId = user.branchId;
    }
}