import { Component, OnInit, ViewChild } from "@angular/core";
import { LocationMasterService } from "../../Services/locationMaster.service";
import { HttpService } from "../../shared/http-service";
import { AppComponent } from "../../app.component";
import { Router } from "@angular/router";
import { AuthData } from "../../auth/auth.model";
import { EmployeeMasterService } from "../../Services/employeeMaster.service";
import { DepartmentMasterService } from "../../Services/departmentMaster.service";
import { APIURLS } from "../../shared/api-url";
import { EmployeeMaster } from "../../Models/employeeMaster.model";
import { NgForm } from "@angular/forms";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert';

import { UserMaster } from "../../Models/userMaster.model";
import { EmployeeAddress } from "../../Models/employeeAddress.model";
import { EmployeeOtherDetails } from "../../Models/employeeOtherDetails.model";
import { EmployeePayroll } from "../../Models/employeePayroll.model";
import { LockoutMaster } from "../../Models/lockoutMaster.model";
import { AuditLogChange } from "../auditlogchange.model";
import * as _ from "lodash";
import { AuditLog } from "../auditlog.model";
import { EmployeeProfileConfig } from "../../Models/employeeProfileConfig.model";
import { ProfileMaster } from "../../Models/profileMaster.model";

declare var jQuery: any;
declare var $: any;
declare var toastr: any;

export class actionItemModel {
    employeeId: string;
    firstName: string;
    middleName: string
    lastName: string;
    email: string;
    baseLocation: string;
    department: string;
    profile: string;
    designation: string;
    employee_type: string;
    role: string;
    manager: string;
    permanent_Address: string;
    phone_Number: string;
    current_Address: string;
    emergency_Contact_Name: string;
    emergency_Contact_Number: string;
    isActive: boolean;
    TeherapeuticSegmentDesc: any;
}

@Component({
	selector: 'app-EmployeeMaster',
	templateUrl: './EmployeeMaster.component.html',
	styleUrls: ['./EmployeeMaster.component.css'],

})
export class EmployeeMasterComponent implements OnInit {
  @ViewChild(NgForm, { static: false }) userForm: NgForm;

    
    path: string = '';
    currentUser: AuthData = {} as AuthData;
    checkAccess: boolean;
    today: Date = new Date();
    public auditTableWidget: any;

    employees: EmployeeMaster[] = [];

    currentEmployeeMaster: EmployeeMaster;
    currentUserMaster: UserMaster;
    currentEmployeeAddress: EmployeeAddress;
    currentEmployeeOtherDetails: EmployeeOtherDetails;
    currentEmployeePayroll: EmployeePayroll;
    oldEmployeeMaster: EmployeeMaster;
    oldEmployeeAddress: EmployeeAddress;

    isGOLoading: boolean = false;
    isUserMasterLoading: boolean = false;
    isSaveLoading: boolean = false;

    isEdit: boolean = false;

    lastManager: string;
    managerWarning: boolean = false;

    managerID: number = null;
    managerEmployeeID: string = null;
    managerName: string = null;
    selectedJoiningDate: Date = null;
    auditReason: string = null;

    auditType: string = null;
    auditLogList: AuditLog[] = [];
    masterName: string = "Employee Master";
    
    selectedProfiles: ProfileMaster[] = [];
    profilesSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'Deselect All',
        itemsShowLimit: 2,
        allowSearchFilter: true
    };

    lastReportingkeydown = 0;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private locationMasterService: LocationMasterService, private employeeMasterService: EmployeeMasterService,
        private departmentMasterService: DepartmentMasterService, private http: HttpClient) {}

    ngOnInit(): void {
        this.path = this.router.url;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.checkAccess = this.appService.validateUrlBasedAccess(this.path);

        if (!this.checkAccess) {
            this.router.navigate(["/unauthorized"]);
        }

        if (this.locationMasterService.assignedLocations.length == 0) {
            this.locationMasterService.getAssignedLocations(this.currentUser.employeeId);
        }
        if (this.employeeMasterService.profiles.length == 0) {
            this.employeeMasterService.getProfiles();
        }
        if (this.employeeMasterService.designations.length == 0) {
            this.employeeMasterService.getDesignations();
        }
        if (this.employeeMasterService.competencies.length == 0) {
            this.employeeMasterService.getCompetency();
        }
        if (this.employeeMasterService.roles.length == 0) {
            this.employeeMasterService.getRoles();
        }

		this.employeeMasterService.pageNumber = 1;
    }

    // Report Functions
    getEmployees() {
        this.isGOLoading = true;
        this.employees = [];
        let param = "GetEmployeesByFilter," + this.employeeMasterService.selectedLocation + "," + this.employeeMasterService.selectedDepartment + "," + this.employeeMasterService.selectedStaffCategory + "," 
            + this.employeeMasterService.selectedEmployeeID + "," + this.employeeMasterService.pageSize + "," + this.employeeMasterService.pageNumber;

        this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_GETEMPLOYEES, param).then((data: EmployeeMaster[]) => {
            if (data.length > 0) {
                this.employees = data.sort((a, b) => { if (a.employeeId > b.employeeId) { return 1; } else if (a.employeeId < b.employeeId) { return -1; } return 0; });
                console.log(this.employees);
                
                this.employeeMasterService.totalCount = data[0].totalCount;
                this.employeeMasterService.totalPages = data[0].totalPages;
            }

            this.isGOLoading = false;
        }).catch(error => {
            swal("Error", "Error fetching employees. Please check the console for error details.", "error");
            console.log(error);
            this.isGOLoading = false;
        });
    }

    clearFilter() {
        this.employeeMasterService.selectedDepartment = null;
        this.employeeMasterService.selectedEmployeeID = null;
        this.employeeMasterService.selectedLocation = null;
        this.employeeMasterService.selectedStaffCategory = null;
    }

    openEmployeeModal(employee: EmployeeMaster, edit: boolean) {
        this.isEdit = edit;     // true: Edit, false: Create
        this.auditReason = null;
        this.selectedProfiles = [];

        if (this.isEdit) {
            // Edit existing employee
            this.currentEmployeeMaster = employee;
            this.oldEmployeeMaster = Object.assign({}, this.currentEmployeeMaster);
            this.editEmployee();
        } else {
            // Create new employee
            this.currentEmployeeMaster = {} as EmployeeMaster;
            this.oldEmployeeMaster = Object.assign({}, this.currentEmployeeMaster);
            this.createEmployee();
        }
    }

    editEmployee() {
        this.managerID = this.currentEmployeeMaster.fkReportingManager;
        this.managerEmployeeID = this.currentEmployeeMaster.reportingManagerEmpId;
        this.managerName = this.currentEmployeeMaster.reportingManagerName;
        this.selectedJoiningDate = new Date(this.currentEmployeeMaster.joiningDate);

        this.isUserMasterLoading = true;

        // Update selected profiles
        let profileIDs: string[] = [];

        if (this.currentEmployeeMaster.profileIDs) {
            profileIDs = this.currentEmployeeMaster.profileIDs.split(",");
        }

        if (profileIDs.length > 0) {
            this.selectedProfiles = this.employeeMasterService.profiles.filter(x => profileIDs.includes(x.id.toString()));
        } else {
            this.selectedProfiles = [];
        }

        this.httpService.getById(APIURLS.BR_MASTER_USERMASTER_API, this.currentEmployeeMaster.id).then((userMasterData: any) => {
            if (userMasterData.id > 0) {
                this.currentUserMaster = userMasterData;

                this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.currentEmployeeMaster.fkAddressId).then((employeeAddressData: any) => {
                    if (employeeAddressData.id > 0) {
                        this.currentEmployeeAddress = employeeAddressData;
                        this.oldEmployeeAddress = Object.assign({}, employeeAddressData);

                        this.httpService.getById(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_GETBYID, this.currentEmployeeMaster.fkOtherDetailsId).then((otherDetailsData: any) => {
                            this.currentEmployeeOtherDetails = otherDetailsData;

                            this.isUserMasterLoading = false;
                            this.showEmployeeModal();

                            // this.httpService.getByParam(APIURLS.BR_EMPLOYEEPROFILECONFIG_GETBYPARAM, this.currentEmployeeMaster.employeeId).then((epcData: EmployeeProfileConfig[]) => {
                            //     if (epcData.length > 0) {
                            //         const profileIDs: number[] = epcData.map(x => x.profileID);
                            //         this.selectedProfiles = this.employeeMasterService.profiles.filter(x => profileIDs.includes(x.id));

                            //         console.log(this.selectedProfiles);
                                
                            //         this.isUserMasterLoading = false;
                            //         this.showEmployeeModal();
                            //     } else {
                            //         this.selectedProfiles = [];
                                
                            //         this.isUserMasterLoading = false;
                            //         this.showEmployeeModal();
                            //     }
                            // }).catch(error => {
                            //     swal("Error", "Error fetching employee profile config data. Please check the console for error details.", "error");
                            //     console.log(error);
                            //     this.isUserMasterLoading = false;
                            //     this.selectedProfiles = [];
                            // });
                        }).catch(error => {
                            swal("Error", "Error fetching employee other details. Please check the console for error details.", "error");
                            console.log(error);
                            this.isUserMasterLoading = false;
                            this.currentEmployeeOtherDetails = null;
                        });
                    } else {
                        swal("Error", "No Employee Address Details found!", "error");
                        console.log("No Employee Address Details found: ");
                        console.log(employeeAddressData);
                    }
                }).catch(error => {
                    swal("Error", "Error fetching employee address details. Please check the console for error details.", "error");
                    console.log(error);
                    this.isUserMasterLoading = false;
                    this.currentEmployeeAddress = null;
                });
            } else {
                swal("Error", "No User Master Details found!", "error");
                console.log("No User Master Details found: ");
                console.log(userMasterData);
            }
        }).catch(error => {
            swal("Error", "Error fetching user master details. Please check the console for error details.", "error");
            console.log(error);
            this.isUserMasterLoading = false;
            this.currentUserMaster = null;
        });
    }

    createEmployee() {
        this.initializeMasterFields();

        this.managerID = null;
        this.managerEmployeeID = null;
        this.managerName = null;
        this.selectedJoiningDate = null;
        this.auditReason = null;
        this.selectedProfiles = [];
        
        this.showEmployeeModal();
    }

    showEmployeeModal() {
        jQuery("#editEmployeeModal").modal("show").on('shown.bs.modal', () => {
            const mainTabElement = document.getElementById("MainTab");
    
            if (mainTabElement) {
                mainTabElement.click();
            } else {
                console.error("MainTab element not found.");
            }
        });
    }

    initializeMasterFields() {
        this.currentEmployeeMaster = {
            id: 0,
            employeeId: "",
            email: "",
            fkAddressId: 0,
            fkOtherDetailsId: 0,
            fkProjectId: 0,
            fkDesignation: 0,
            fkCompetency: 0,
            fkDepartment: 0,
            fkReportingManager: 0,
            fkManager: 0,
            fkParentId: 0,
            fkParentIdCount: 0,
            fkApprovalTemplateId: 0,
            fkPayroll: 0,
            firstName: "",
            middleName: "",
            lastName: "",
            imgUrl: "",
            designation: "",
            baseLocation: "",
            description: "",
            interviwer: 0,
            joiningDate: "",
            redirectUrl: "",
            createdBy: Number.parseInt(this.currentUser.employeeId),
            createdDate: "",
            isActive: true,
            fkProfileId: 0,
            fkRoleId: 0,
            fkSbuId: 0,
            desigRoleId: 517,
            hrEmployeeId: 0
        } as EmployeeMaster;

        this.oldEmployeeMaster = Object.assign({}, this.currentEmployeeMaster);

        this.currentUserMaster = {
            id: 0,
            fkCompanyId: 0,
            firstName: "",
            middleName: "",
            lastName: "",
            fullName: "",
            fkEmpId: 0,
            employeeId: "",
            password: "",
            email: "",
            phoneNumber: 0,
            fkDesignationId: 0,
            fkRoleId: 0,
            fkSubroleId: 0,
            fkProfileId: 0,
            fkDepartmentId: 0,
            lastPassword: "",
            createdBy: Number.parseInt(this.currentUser.employeeId),
            createdDate: ""
        } as UserMaster;

        this.currentEmployeeAddress = {
            id: 0,
            fkEmpId: 0,
            employeeId: "",
            personalEmail: "",
            phoneNumber: "",
            emgContactNumber: "",
            emgContactName: "",
            currentAddress: "",
            permanentAddress: "",
            nomineeName: "",
            nomineePhone: "",
            guardianName: "",
            guardianRelation: "",
            guardianPhone: "",
            isActive: true,
            module_enableId: 0,
            createdBy: Number.parseInt(this.currentUser.employeeId),
            createdDate: ""
        } as EmployeeAddress;

        this.oldEmployeeAddress = Object.assign({}, this.currentEmployeeAddress);

        this.currentEmployeeOtherDetails = {
            id: 0,
            fkEmpId: 0,
            employeeId: "",
            designation: 0,
            panNumber: "",
            visaIsActive: true,
            visaNumber: "",
            passportNumber: "",
            qualification: "",
            yearOfPassing: "",
            hardSkill: "",
            softSkill: "",
            description: "",
            yearExp: 0,
            relativeExp: 0,
            lastCompany: "",
            secondLastCompany: "",
            previousLocation: "",
            currentLocation: "",
            createdBy: Number.parseInt(this.currentUser.employeeId),
            createdDate: ""
        } as EmployeeOtherDetails;

        this.currentEmployeePayroll = {
            id: 0,
            employeeId: "",
            currentAnnualCtc: 0,
            fixedCtc: 0,
            veriablePay: 0,
            currentWorkStatus: "",
            billingRate: 0,
            previousAppraisalDate: "",
            appraisalDueDate: "",
            createdBy: Number.parseInt(this.currentUser.employeeId),
            createdDate: "",
            modifiedBy: null,
            modifiedDate: null,
            isActive: true,
        } as EmployeePayroll;
    }

    viewAuditLogs(id: number) {
        let stringparms = this.masterName + "," + id;

        this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
            if (data) {
                this.auditLogList = data;
                this.auditLogList.reverse();
                
                jQuery("#auditModal").modal("show");
            }

            this.reinitPOUPDatatable();
        }).catch(error => {
            swal("Error", "Error fetching audit logs. Please check the console for error details.", "error");
            console.log(error);
        });
    }

    objParser(val) {
        return JSON.parse(val);
    }

    private initPOUPDatatable(): void {
        let exampleId: any = jQuery("#auditTable");

        this.auditTableWidget = exampleId.DataTable({
            "order": [[0, "desc"]],
            "lengthChange": false,
            "pageLength": 5,
            "searching": false,
            "columnDefs": [
                {
                    render: function (data, type, full, meta) {
                        return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
                    },
                    targets: 5
                }
            ]
        });
    }

    private reinitPOUPDatatable(): void {
        if (this.auditTableWidget) {
            this.auditTableWidget.destroy();
            this.auditTableWidget = null;
        }

        setTimeout(() => this.initPOUPDatatable(), 0);
    }

    // Save functions
    validateInputs(): boolean {
        if (!this.currentEmployeeMaster.employeeId) {
            toastr.error("Please enter the Employee ID");
            return false;
        }
        if (!this.currentEmployeeMaster.firstName) {
            toastr.error("Please enter the First Name");
            return false;
        }
        if (!this.currentEmployeeMaster.email) {
            toastr.error("Please enter the Eemail ID");
            return false;
        }
        if (!this.currentEmployeeMaster.email.toLowerCase().includes("@microlabs.in") || this.currentEmployeeMaster.email.toLowerCase() == "@microlabs.in") {
            toastr.error("Please enter a valid Eemail ID");
            return false;
        }
        if (!this.currentUserMaster.password && this.isEdit) {
            toastr.error("Please enter the Password");
            return false;
        }
        if (!this.currentEmployeeMaster.baseLocation) {
            toastr.error("Please select the Location");
            return false;
        }
        if (!this.currentEmployeeMaster.fkDepartment) {
            toastr.error("Please select the Department");
            return false;
        }
        if (this.selectedProfiles.length == 0) {
            toastr.error("Please select at least one Profile");
            return false;
        }
        if (!this.currentEmployeeMaster.fkDesignation) {
            toastr.error("Please select the Designation");
            return false;
        }
        if (!this.currentEmployeeMaster.fkCompetency) {
            toastr.error("Please select the Employee Type");
            return false;
        }
        if (!this.managerEmployeeID) {
            toastr.error("Please enter the Manager Employee ID");
            return false;
        }
        if (!this.selectedJoiningDate) {
            toastr.error("Please select the Joining Date");
            return false;
        }
        if (!this.auditReason) {
            toastr.error("Please enter the Audit Reason");
            return false;
        }

        return true;
    }

    onSaveUserClick() {
        if (!this.validateInputs()) {
            return;
        }

        this.isSaveLoading = true;
        let returnFlag = false;

        if (this.selectedProfiles.find(x => x.id == 1) != undefined && this.currentEmployeeMaster.isActive == false && this.isEdit) {
            let params = "GetAdmins,,,,,,";

            this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_GETEMPLOYEES, params).then((data: EmployeeMaster[]) => {
                data = data.filter(x => x.employeeId != this.currentEmployeeMaster.employeeId);

                if (data.length == 0) {
                    swal("Message", "Please nominate another user for this role before making them inactive.", "warning");
                    returnFlag = true;
                }
            }).catch(error => {
                this.isSaveLoading = false;
                console.log(error);
            });
        }

        if (returnFlag) {
            this.isSaveLoading = false;
            return;
        }

        let params = "GetReportingEmployees,,,," + this.currentEmployeeMaster.employeeId + ",,";

        this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_GETEMPLOYEES, params).then((data: EmployeeMaster[]) => {
            if (data.length > 0) {
                let employeesList = "";

                data.forEach(element => {
                    employeesList += "\n" + element.firstName + " " + element.lastName + "(" + element.employeeId + ")";
                });

                swal({
                    title: "Are you sure to make this employee inactive?",
                    text: "Below are the list of employees that report to this employee: " + employeesList,
                    icon: "warning",
                    dangerMode: true,
                    buttons: [true, true],
                }).then((save) => {
                    if (save) {
                        this.saveUser();
                    }
                });
            } else {
                this.saveUser();
            }            
        }).catch(error => {
            this.isSaveLoading = false;
            console.log(error);
        });
    }

    saveUser() {
        let designation = this.employeeMasterService.designations.find(x => x.id == this.currentEmployeeMaster.fkDesignation);

        if (designation) {
            this.currentEmployeeMaster.designation = designation.name;
        } else {
            toastr.error("Please select the Designation");
            this.isSaveLoading = false;

            return;
        }

        this.currentEmployeeMaster.fkReportingManager = this.managerID;
        this.currentEmployeeMaster.fkManager = this.currentEmployeeMaster.fkManager ? this.currentEmployeeMaster.fkManager : this.managerID;
        this.currentEmployeeMaster.fkParentId = this.currentEmployeeMaster.fkParentId ? this.currentEmployeeMaster.fkParentId : this.managerID;
        // this.currentEmployeeMaster.designation = this.employeeMasterService.designations.find(x => x.id == this.currentEmployeeMaster.fkDesignation).name;
        this.currentEmployeeMaster.fkParentIdCount = 1;
        this.currentEmployeeMaster.fkProjectId = 1;
        this.currentEmployeeMaster.fkSbuId = 1;
        this.currentEmployeeMaster.fkApprovalTemplateId = 1;
        this.currentEmployeeMaster.imgUrl = "../assets/dist/img/pp.jpg";
        this.currentEmployeeMaster.joiningDate = this.currentEmployeeMaster.joiningDate && this.currentEmployeeMaster.joiningDate != "" ? this.currentEmployeeMaster.joiningDate 
            : this.selectedJoiningDate != null ? this.employeeMasterService.getFormattedDate(this.selectedJoiningDate) : null;

        this.currentUserMaster.fkCompanyId = 1;

        if (!this.isEdit) {
            this.saveCreatedUser();
        } else {
            this.saveUpdatedUser();
        }
    }

    saveCreatedUser() {
        this.auditType = "Create";
        this.currentEmployeeAddress.module_enableId = 0;
        this.currentEmployeeMaster.createdBy = Number.parseInt(this.currentUser.employeeId);
        this.currentEmployeeAddress.createdBy = Number.parseInt(this.currentUser.employeeId);
        this.currentEmployeeOtherDetails.createdBy = Number.parseInt(this.currentUser.employeeId);
        this.currentUserMaster.createdBy = Number.parseInt(this.currentUser.employeeId);

        let params: string = "GetSingleEmployee,,,," + this.currentEmployeeMaster.employeeId + ",,";

        this.httpService.getByParam(APIURLS.BR_EMPLOYEEMASTER_GETEMPLOYEES, params).then((data: EmployeeMaster[]) => {
            if (data.length > 0) {
                swal("Message", "An employee with the same employee ID already exists. Please select a unique employee ID.", "warning");
                this.isSaveLoading = false;

                return;
            } else {
                this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.currentEmployeeAddress).then((addressData: EmployeeAddress) => {
                    if (addressData.id > 0) {
                        this.currentEmployeeMaster.fkAddressId = addressData.id;
        
                        this.httpService.post(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.currentEmployeeOtherDetails).then((otherDetailsData: EmployeeOtherDetails) => {
                            if (otherDetailsData.id > 0) {
                                this.currentEmployeeMaster.fkOtherDetailsId = otherDetailsData.id;
        
                                this.assignFKProfileIDs();
        
                                // Add profileIDs
                                this.currentEmployeeMaster.profileIDs = this.selectedProfiles.map(x => x.id).join();
                                console.log(this.currentEmployeeMaster.profileIDs);
        
                                this.httpService.post(APIURLS.BR_EMPLOYEEMASTER_API, this.currentEmployeeMaster).then((employeeMasterData: EmployeeMaster) => {
                                    if (employeeMasterData.id > 0) {
                                        this.currentEmployeeAddress.fkEmpId = employeeMasterData.id;
                                        this.currentEmployeeAddress.employeeId = employeeMasterData.employeeId;
            
                                        this.currentUserMaster.email = employeeMasterData.email;
                                        this.currentUserMaster.firstName = employeeMasterData.firstName;
                                        this.currentUserMaster.middleName = employeeMasterData.middleName;
                                        this.currentUserMaster.lastName = employeeMasterData.lastName;
                                        this.currentUserMaster.fullName = employeeMasterData.firstName + " " + employeeMasterData.middleName + " " + employeeMasterData.lastName;
                                        this.currentUserMaster.fkEmpId = employeeMasterData.id;
                                        this.currentUserMaster.employeeId = employeeMasterData.employeeId;
                                        this.currentUserMaster.fkDesignationId = employeeMasterData.fkDesignation;
                                        this.currentUserMaster.fkDepartmentId = employeeMasterData.fkDepartment;
                                        this.currentUserMaster.fkRoleId = employeeMasterData.fkRoleId;
                                        this.currentUserMaster.fkSubroleId = employeeMasterData.fkRoleId;
                                        this.currentUserMaster.isActive = employeeMasterData.isActive;
                                        this.currentUserMaster.password = "string";
                                        this.currentUserMaster.lastPassword = "string";
                                        // this.currentUserMaster.fkProfileId = employeeMasterData.fkProfileId;
            
                                        this.httpService.post(APIURLS.BR_MASTER_USERMASTER_API, this.currentUserMaster).then((userMasterData: UserMaster) => {
                                            if (userMasterData.id > 0) {
                                                let lockoutMaster: LockoutMaster = {} as LockoutMaster;
                                                lockoutMaster.employeeId = this.currentEmployeeMaster.employeeId;
                                                lockoutMaster.count = 0;
                                                lockoutMaster.lockoutFlag = false;
                                                lockoutMaster.lockoutDate = null;
                                                lockoutMaster.isActive = true;
                                                lockoutMaster.modifiedBy = this.currentUser.employeeId;
        
                                                this.httpService.post(APIURLS.BR_MASTER_LOCKOUT_BYID_API, lockoutMaster).then((lockoutMasterData: LockoutMaster) => {
                                                    jQuery("#editEmployeeModal").modal("hide");
                                                    swal("Success", "Employee has been created successfully!", "success");
            
                                                    this.insertAuditLog(employeeMasterData.id);
                                                    this.getEmployees();
            
                                                    this.isSaveLoading = false;
        
                                                    // this.currentEmployeeAddress.fkEmpId = employeeMasterData.id;
                                                    // this.currentEmployeeOtherDetails.fkEmpId = employeeMasterData.id;
        
                                                    // this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.currentEmployeeMaster.fkAddressId, this.currentEmployeeAddress).then((addressData1: any) => {
                                                    //     if (addressData1 == 200) {
                                                    //         this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.currentEmployeeMaster.fkOtherDetailsId, this.currentEmployeeOtherDetails).then((otherDetailsData: any) => {
                                                    //             if (otherDetailsData != 200) {
                                                    //                 console.log("Error updating employee other details ID: ");
                                                    //                 console.log(otherDetailsData);
                                                    //             }
                                                    //         }).catch(error => {
                                                    //             console.log("Error updating employee other details ID: ");
                                                    //             console.log(error);
                                                    //         });
                                                    //     } else {
                                                    //         console.log("Error updating employee address ID: ");
                                                    //         console.log(addressData1);
                                                    //     }
                                                    // }).catch(error=> {
                                                    //         console.log("Error updating employee address ID: ");
                                                    //         console.log(error);
                                                    // });
                                                }).catch(error => {
                                                    this.isSaveLoading = false;
                                                    console.log(error);
                                                    swal("Error", "Error saving the lockout master details. Please check the console for error details.", "error");
                                                });
                                            } else {
                                                console.log(userMasterData);
                                                this.isSaveLoading = false;
                                            }
                                        }).catch(error => {
                                            this.isSaveLoading = false;
                                            console.log(error);
                                            swal("Error", "Error saving the user master details. Please check the console for error details.", "error");
                                        });
                                    } else {
                                        console.log(employeeMasterData);
                                        this.isSaveLoading = false;
                                    }
                                }).catch(error => {
                                    this.isSaveLoading = false;
                                    console.log(error);
                                    swal("Error", "Error saving the employee master details. Please check the console for error details.", "error");
                                });
                            } else {
                                console.log(otherDetailsData);
                                this.isSaveLoading = false;
                            }
                        }).catch(error => {
                            this.isSaveLoading = false;
                            console.log(error);
                            swal("Error", "Error saving the employee other details. Please check the console for error details.", "error");
                        });
                    } else {
                        console.log(addressData);
                        this.isSaveLoading = false;
                    }
                }).catch(error => {
                    this.isSaveLoading = false;
                    console.log(error);
                    swal("Error", "Error saving the employee address details. Please check the console for error details.", "error");
                });
            }
        }).catch(error => {
            swal("Error", "Error fetching employee ID from employee master. Please check the console for error details.", "error");
            console.log(error);
            this.isSaveLoading = false;
        });
    }

    saveUpdatedUser() {
        this.auditType = "Update";
        this.currentEmployeeMaster.modifiedBy = Number.parseInt(this.currentUser.employeeId);
        this.currentEmployeeAddress.modifiedBy = Number.parseInt(this.currentUser.employeeId);
        this.currentEmployeeOtherDetails.modifiedBy = Number.parseInt(this.currentUser.employeeId);
        this.currentUserMaster.modifiedBy = Number.parseInt(this.currentUser.employeeId);

        this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEADDRESS_API, this.currentEmployeeMaster.fkAddressId, this.currentEmployeeAddress).then((addressData: any) => {
            if (addressData == 200) {
                console.log(this.currentEmployeeOtherDetails);
                this.httpService.put(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_API, this.currentEmployeeMaster.fkOtherDetailsId, this.currentEmployeeOtherDetails).then((otherDetailsData: any) => {
                    if (otherDetailsData == 200) {
                        this.assignFKProfileIDs();

                        // Add profileIDs
                        this.currentEmployeeMaster.profileIDs = this.selectedProfiles.map(x => x.id).join();
                        console.log(this.currentEmployeeMaster.profileIDs);

                        this.httpService.put(APIURLS.BR_EMPLOYEEMASTER_API, this.currentEmployeeMaster.id, this.currentEmployeeMaster).then((employeeMasterData: any) => {
                            if (employeeMasterData == 200) {
                                this.currentUserMaster.email = this.currentEmployeeMaster.email;
                                this.currentUserMaster.firstName = this.currentEmployeeMaster.firstName;
                                this.currentUserMaster.middleName = this.currentEmployeeMaster.middleName;
                                this.currentUserMaster.lastName = this.currentEmployeeMaster.lastName;
                                this.currentUserMaster.fullName = this.currentEmployeeMaster.firstName + " " + this.currentEmployeeMaster.middleName + " " + this.currentEmployeeMaster.lastName;
                                this.currentUserMaster.fkEmpId = this.currentEmployeeMaster.id;
                                this.currentUserMaster.employeeId = this.currentEmployeeMaster.employeeId;
                                this.currentUserMaster.fkDesignationId = this.currentEmployeeMaster.fkDesignation;
                                this.currentUserMaster.fkDepartmentId = this.currentEmployeeMaster.fkDepartment;
                                this.currentUserMaster.fkRoleId = this.currentEmployeeMaster.fkRoleId;
                                this.currentUserMaster.fkProfileId = this.currentEmployeeMaster.fkProfileId;
                                this.currentUserMaster.fkSubroleId = this.currentEmployeeMaster.fkRoleId;
                                this.currentUserMaster.isActive = this.currentEmployeeMaster.isActive;

                                this.httpService.put(APIURLS.BR_MASTER_USERMASTER_API, this.currentUserMaster.id, this.currentUserMaster).then((userMasterData: any) => {
                                    if (userMasterData == 200) {
                                        jQuery("#editEmployeeModal").modal("hide");
                                        swal("Success", "Employee has been updated successfully!", "success");

                                        this.insertAuditLog(this.currentEmployeeMaster.id);
                                        this.getEmployees();

                                        this.isSaveLoading = false;
                                    } else {
                                        console.log(userMasterData);
                                        this.isSaveLoading = false;
                                    }
                                }).catch(error => {
                                    this.isSaveLoading = false;
                                    console.log(error);
                                    swal("Error", "Error saving the user master details. Please check the console for error details.", "error");
                                });
                            } else {
                                console.log(employeeMasterData);
                                this.isSaveLoading = false;
                            }
                        }).catch(error => {
                            this.isSaveLoading = false;
                            console.log(error);
                            swal("Error", "Error saving the employee master details. Please check the console for error details.", "error");
                        });
                    } else {
                        console.log(otherDetailsData);
                        this.isSaveLoading = false;
                    }
                }).catch(error => {
                    this.isSaveLoading = false;
                    console.log(error);
                    swal("Error", "Error saving the employee other details. Please check the console for error details.", "error");
                });
            } else {
                console.log(addressData);
                this.isSaveLoading = false;
            }
        }).catch(error => {
            this.isSaveLoading = false;
            console.log(error);
            swal("Error", "Error saving the employee address details. Please check the console for error details.", "error");
        });
    }

    assignFKProfileIDs() {
        let employeeProfile = this.employeeMasterService.profiles.find(x => x.name == "Employee");
        let managerProfile = this.employeeMasterService.profiles.find(x => x.name == "Manager");
        let raProviderProfile = this.employeeMasterService.profiles.find(x => x.name == "RA_Provider");
        let medServicesProfile = this.employeeMasterService.profiles.find(x => x.name == "Med_Servives");
        let medServicesReviewerProfile = this.employeeMasterService.profiles.find(x => x.name == "Med_Servives_Reviewer");
        let medServicesMedHeadProfile = this.employeeMasterService.profiles.find(x => x.name == "Med_Servives_MedHead");
        let medicalServiceProfile = this.employeeMasterService.profiles.find(x => x.name == "Medical Service");
        let ml15JWApproverProfile = this.employeeMasterService.profiles.find(x => x.name == "ML15_JW_Approver");
        let securityProfile = this.employeeMasterService.profiles.find(x => x.name == "Security");
        let adminProfile = this.employeeMasterService.profiles.find(x => x.name == "Admin");
        let developerProfile = this.employeeMasterService.profiles.find(x => x.name == "Developer");

        if (employeeProfile) {
            if (this.selectedProfiles.find(x => x.id == employeeProfile.id)) {
                // 4 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = employeeProfile.id;
            }
        }
        if (managerProfile) {
            if (this.selectedProfiles.find(x => x.id == managerProfile.id)) {
                // 3 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = managerProfile.id;
            }
        }

        // if (this.selectedProfiles.find(x => x.id == this.employeeMasterService.profiles.find(x => x.name == "Office Admin").id)) {
        //     // 1004 (DISABLED) - Same in PROD
        //     this.currentEmployeeMaster.fkProfileId = this.employeeMasterService.profiles.find(x => x.name == "Office Admin").id;
        // }
        if (raProviderProfile) {
            if (this.selectedProfiles.find(x => x.id == raProviderProfile.id)) {
                // 1008 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = raProviderProfile.id;
            }
        }
        if (medServicesProfile) {
            if (this.selectedProfiles.find(x => x.id == medServicesProfile.id)) {
                // 1009 - PROD Only
                this.currentEmployeeMaster.fkProfileId = medServicesProfile.id;
            }
        }
        if (medServicesReviewerProfile) {
            if (this.selectedProfiles.find(x => x.id == medServicesReviewerProfile.id)) {
                // 1010 - PROD Only
                this.currentEmployeeMaster.fkProfileId = medServicesReviewerProfile.id;
            }
        }
        if (medServicesMedHeadProfile) {
            if (this.selectedProfiles.find(x => x.id == medServicesMedHeadProfile.id)) {
                // 1011 - PROD Only
                this.currentEmployeeMaster.fkProfileId = medServicesMedHeadProfile.id;
            }
        }
        if (medicalServiceProfile) {
            if (this.selectedProfiles.find(x => x.id == medicalServiceProfile.id)) {
                // 1010 - DEV Only
                this.currentEmployeeMaster.fkProfileId = medicalServiceProfile.id;
            }
        }
        if (ml15JWApproverProfile) {
            if (this.selectedProfiles.find(x => x.id == ml15JWApproverProfile.id)) {
                // 1017 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = ml15JWApproverProfile.id;
            }
        }
        
        if (securityProfile) {
            if (this.selectedProfiles.find(x => x.id == securityProfile.id)) {
                // 1002 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = securityProfile.id;
            }
        }
        if (adminProfile) {
            if (this.selectedProfiles.find(x => x.id == adminProfile.id)) {
                // 1 - Same in PROD
                this.currentEmployeeMaster.fkProfileId = adminProfile.id;
            }
        }
        if (developerProfile) {
            if (this.selectedProfiles.find(x => x.id == developerProfile.id)) {
                // 1014 in DEV, 1020 in PROD
                this.currentEmployeeMaster.fkProfileId = developerProfile.id;
            }
        }

        this.currentEmployeeMaster.fkProfileId = this.currentEmployeeMaster.fkProfileId ? this.currentEmployeeMaster.fkProfileId : 4; 
    }

    insertAuditLog(id: number) {
        let oldObj = this.oldEmployeeMaster;
        let newObj = this.currentEmployeeMaster;
        let oldObject: actionItemModel = new actionItemModel();
        let newObject: actionItemModel = new actionItemModel();
        let oldLocation = this.locationMasterService.findLocationByID(Number.parseInt(oldObj.baseLocation));
        let newLocation = this.locationMasterService.findLocationByID(Number.parseInt(newObj.baseLocation));

        let oldDepartment = this.departmentMasterService.departments.find(s => s.id === oldObj.fkDepartment);
        let oldDesignation = this.employeeMasterService.designations.find(s => s.id === oldObj.fkDesignation);
        let oldCompetency = this.employeeMasterService.competencies.find(s => s.id === oldObj.fkCompetency);
        let oldRole = this.employeeMasterService.roles.find(e => e.id == oldObj.fkRoleId);

        oldObject.employeeId = oldObj.employeeId;
        oldObject.firstName = oldObj.firstName;
        oldObject.middleName = oldObj.middleName;
        oldObject.lastName = oldObj.lastName;
        oldObject.email = oldObj.email;
        oldObject.baseLocation = oldObj.baseLocation ? oldLocation.code + " - " + oldLocation.name : null;
        oldObject.department = oldObj.fkDepartment ? (oldDepartment ? oldDepartment.name : null) : null;
        oldObject.designation = oldObj.fkDesignation ? (oldDesignation ? oldDesignation.name : null) : null;
        // oldObject.profile = oldObj.fkProfileId ? this.employeeMasterService.profiles.find(s => s.id === oldObj.fkProfileId).name : null;
        oldObject.employee_type = oldObj.fkCompetency ? (oldCompetency ? oldCompetency.name : null) : null;
        oldObject.role = oldObj.fkRoleId ? (oldRole ? oldRole.role : null) : null;
        oldObject.manager = oldObj.fkManager ? oldObj.reportingManagerName : null;
        oldObject.isActive = oldObj.isActive;
        oldObject.permanent_Address = this.oldEmployeeAddress ? this.oldEmployeeAddress.permanentAddress : null;
        oldObject.current_Address = this.oldEmployeeAddress ? this.oldEmployeeAddress.currentAddress : null;
        oldObject.emergency_Contact_Name = this.oldEmployeeAddress ? this.oldEmployeeAddress.emgContactName : null;
        oldObject.emergency_Contact_Number = this.oldEmployeeAddress ? this.oldEmployeeAddress.emgContactNumber : null;
        oldObject.phone_Number = this.oldEmployeeAddress ? this.oldEmployeeAddress.phoneNumber : null;

        if (oldObj.profileIDs) {
            let oldProfilesIDs: string[] = oldObj.profileIDs.split(",");
            let oldProfiles: string[] = [];
            oldProfilesIDs.forEach(element => {
                let oldProfile = this.employeeMasterService.profiles.find(x => x.id.toString() == element);

                if (oldProfile) {
                    oldProfiles.push(oldProfile.name);
                }
            });
            let oldProfileNames: string = oldProfiles.join();
            oldObject.profile = oldProfileNames ? oldProfileNames : null;
        } else {
            oldObject.profile = null;
        }

        let newDepartment = this.departmentMasterService.departments.find(s => s.id === newObj.fkDepartment);
        let newDesignation = this.employeeMasterService.designations.find(s => s.id === newObj.fkDesignation);
        let newCompetency = this.employeeMasterService.competencies.find(s => s.id === newObj.fkCompetency);
        let newRole = this.employeeMasterService.roles.find(e => e.id == newObj.fkRoleId);

        newObject.employeeId = newObj.employeeId;
        newObject.firstName = newObj.firstName;
        newObject.middleName = newObj.middleName;
        newObject.lastName = newObj.lastName;
        newObject.email = newObj.email;
        newObject.baseLocation = newObj.baseLocation ? newLocation.code + " - " + newLocation.name : null;
        newObject.department = newObj.fkDepartment ? (newDepartment ? newDepartment.name : null) : null;
        newObject.designation = newObj.fkDesignation ? (newDesignation ? newDesignation.name : null) : null;
        // newObject.profile = newObj.fkProfileId ? this.employeeMasterService.profiles.find(s => s.id === newObj.fkProfileId).name : null;
        newObject.employee_type = newObj.fkCompetency ? (newCompetency ? newCompetency.name : null) : null;
        newObject.role = newObj.fkRoleId ? (newRole ? newRole.role : null) : null;
        newObject.manager = newObj.fkManager ? newObj.reportingManagerName : null;
        newObject.isActive = newObj.isActive;
        newObject.permanent_Address = this.currentEmployeeAddress ? this.currentEmployeeAddress.permanentAddress : null;
        newObject.current_Address = this.currentEmployeeAddress ? this.currentEmployeeAddress.currentAddress : null;
        newObject.emergency_Contact_Name = this.currentEmployeeAddress ? this.currentEmployeeAddress.emgContactName : null;
        newObject.emergency_Contact_Number = this.currentEmployeeAddress ? this.currentEmployeeAddress.emgContactNumber : null;
        newObject.phone_Number = this.currentEmployeeAddress ? this.currentEmployeeAddress.phoneNumber : null;
        
        if (newObj.profileIDs) {
            let newProfilesIDs: string[] = newObj.profileIDs.split(",");
            let newProfiles: string[] = [];
            newProfilesIDs.forEach(element => {
                let newProfile = this.employeeMasterService.profiles.find(x => x.id.toString() == element);

                if (newProfile) {
                    newProfiles.push(newProfile.name);
                }
            });
            let newProfileNames: string = newProfiles.join();
            newObject.profile = newProfileNames ? newProfileNames : null;
        } else {
            newObject.profile = null;
        }

        let beforekey = Object.keys(oldObject);
        let aftrekey = Object.keys(newObject);
        var biggestKey = 0;
        if (beforekey.length > 0) {
            var biggestKey = beforekey.length;
        }
        else {
            var biggestKey = aftrekey.length;
        }
        
        let auditlogchangeList: AuditLogChange[] = [];

        for (var i = 0; i < biggestKey; i++) {
            if (this.auditType == "Update") {
                if (_.isEqual(beforekey[i], aftrekey[i]) && !_.isEqual(oldObject[beforekey[i]], newObject[aftrekey[i]])) {
                    let auditlog: AuditLogChange = new AuditLogChange();
                    auditlog.fieldname = beforekey[i];
                    auditlog.oldvalue = oldObject[beforekey[i]];
                    auditlog.newvalue = newObject[aftrekey[i]];
                    auditlogchangeList.push(auditlog);
                }
            } else if (this.auditType == "Create") {
                let auditlog: AuditLogChange = new AuditLogChange();
                auditlog.fieldname = aftrekey[i];
                auditlog.oldvalue = oldObject[beforekey[i]];
                auditlog.newvalue = newObject[aftrekey[i]];
                auditlogchangeList.push(auditlog);
            }
        }

        let auditlog: AuditLog = new AuditLog();
        auditlog.auditDateTime = new Date().toLocaleString();
        auditlog.aduitUser = this.currentUser.fullName;
        auditlog.auditType = this.auditType;
        auditlog.masterName = this.masterName;
        auditlog.tableId = id;
        auditlog.keyValue = newObj.employeeId ? newObj.employeeId + "-" + newObj.firstName + newObj.lastName : oldObj.employeeId + "-" + oldObj.firstName + oldObj.lastName;
        auditlog.changes = JSON.stringify(auditlogchangeList);
        auditlog.oldValues = JSON.stringify(oldObj);
        auditlog.newValues = JSON.stringify(newObj);
        auditlog.purpose = this.auditReason;

        this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog).catch(error => {
            console.log("Error saving audit logs: ");
            console.log(error);
        });
    }

    // Pagination Functions
    gotoPage(no) {
		if (this.employeeMasterService.pageNumber == no) return;
		this.employeeMasterService.pageNumber = no;
		this.getEmployees();
	}

	pageSizeChange() {
		this.employeeMasterService.pageNumber = 1;
		this.getEmployees();
	}

    // Profile Multi-select Functions
    onProfilesDeselectAll(event: any) {
        // Do Nothing
    }

    onProfilesSelectAll(event: any) {
        // Do Nothing
    }

    onProfilesSelect(event: any) {
        // Do Nothing
    }

    onProfilesDeselect(event: any) {
        // Do Nothing
    }

    // Tab Functions
    openTab(event, tabName) {
        let tabContent = Array.from(document.getElementsByClassName("tabContent") as HTMLCollectionOf<HTMLElement>);
        tabContent.forEach((value, index) => {
            tabContent[index].style.display = "none";
        });

        let tabLinks = Array.from(document.getElementsByClassName("tabLinks") as HTMLCollectionOf<HTMLElement>);
        tabLinks.forEach((value, index) => {
            tabLinks[index].className = tabLinks[index].className.replace(" active", "");
        });

        document.getElementById(tabName).style.display = "block";
        event.currentTarget.className += " active";
    }

    // Autocomplete Functions
    getManager(event) {
        let text = event.target.value;
        let elementID = "#managerEmployeeID";
        let dropdownID = "#managerEmployeeIDDropdown";
        // let elementID = "#employeeNumber" + participant.serialNumber;
        // let dropdownID = "#employeeNumberDropdown" + participant.serialNumber;

        if (text.length <= 3) {
            return;
        }

        if (event.timeStamp - this.lastReportingkeydown > 400) {
            this.get(text).then((data: any) => {
                if (data.length > 0) {
                    const self = this;
                    var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
                    var list = $.map(sortedList, function (item) {
                        return { 
                            label: item.fullName + " (" + item.employeeId + ")", 
                            value: item.employeeId,
                            fullName: item.fullName,
                            mobileNo: item.mobileNo,
                            emailId: item.emailId,
                            id: item.id
                        };
                    });
                    $(elementID).autocomplete({
                        source: list,
                        classes: {
                            "ui-autocomplete": "highlight",
                            "ui-menu-item": "list-group-item"
                        },
                        change: function (event, ui) {
                            if (ui.item) {
                                $(dropdownID).val(ui.item.value);
                                $(elementID).val(ui.item.value);
                                self.updateManagerValues(ui);
                            }
                            else {
                                $(dropdownID).val('');
                                $(elementID).val('');
                            }
                        },
                        select: function (event, ui) {
                            if (ui.item) {
                                $(dropdownID).val(ui.item.value);
                                $(elementID).val(ui.item.value);
                                self.updateManagerValues(ui);
                            }
                            else {
                                $(dropdownID).val('');
                                $(elementID).val('');
                            }
                            return false;
                        }
                    });
                }
            });
        }
        this.lastReportingkeydown = event.timeStamp;
    }

    updateManagerValues(ui: any) {
        this.managerEmployeeID = ui.item.value;
        let splitString: string[] = ui.item.fullName.split("-");
        this.managerName = splitString[0];
        this.managerID = ui.item.id;
        // this.department = splitString[2];
        // this.mobileNumber = ui.item.mobileNo;
        // this.emailId = ui.item.emailId;

        this.currentEmployeeMaster.reportingManagerName = this.managerName;
        this.currentEmployeeMaster.reportingManagerEmpId = this.managerEmployeeID;
    }

    get(value: string) {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + "EmployeeMaster/GetEmployeesList/" + value, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

   getHeader(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
}