import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http-service";
import { APIURLS } from "../shared/api-url";
import { ProfileMaster } from "../Models/profileMaster.model";
import { DesignationMaster } from "../Models/designationMaster.model";
import { CompetencyMaster } from "../Models/competencyMaster.model";
import { RoleMaster } from "../Models/roleMaster.model";

@Injectable({
    providedIn: 'root'
})
export class EmployeeMasterService {
    selectedLocation: string = null;
    selectedDepartment: string = null;
    selectedEmployeeID: string = null;
    selectedStaffCategory: string = null;

    pageSize: any = 10;
	pageNumber: any;
	totalCount: number;
	totalPages: number;
    
    profiles: ProfileMaster[] = [];
    designations: DesignationMaster[] = [];
    competencies: CompetencyMaster[] = [];
    roles: RoleMaster[] = [];

    constructor(private httpService: HttpService) { }

    getProfiles() {
        this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: ProfileMaster[]) => {
            if (data.length > 0) {
                this.profiles = data.filter(x => x.isActive == true).sort((a, b) => { if (a.name > b.name) { return 1; } else if (a.name < b.name) { return -1; } return 0; });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    getDesignations() {
        this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: DesignationMaster[]) => {
            if (data.length > 0) {
                this.designations = data.filter(x => x.isActive == true).sort((a, b) => { if (a.name > b.name) { return 1 } else if (a.name < b.name) { return -1 } return 0; });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    getCompetency() {
        this.httpService.get(APIURLS.BR_COMPETENCY).then((data: CompetencyMaster[]) => {
            this.competencies = data.filter(x => x.isActive == true).sort((a, b) => { if (a.name > b.name) { return 1; } else if (a.name < b.name) { return -1; } return 0 });
        }).catch(error => {
            console.log(error);
        });
    }

    getRoles() {
        this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: RoleMaster[]) => {
            if (data.length > 0) {
                this.roles = data.filter(x => x.isActive == true).sort((a, b) => { if (a.role > b.role) { return 1; } else if (a.role < b.role) { return -1; } return 0; });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    getFormattedDate(d: Date): string {
        let date = new Date(d);

        return date.getFullYear() + "/" +
            ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
            ("00" + date.getDate()).slice(-2);
    }

    getFormattedTime(t: Date): string {
        let date = new Date(t);

        return ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
    }
    
    getFormattedDateTime(d: Date): string {
        let date = new Date(d);

        return date.getFullYear() + "/" +
            ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
            ("00" + date.getDate()).slice(-2) + " " + 
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
    }
}