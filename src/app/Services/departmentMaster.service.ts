import { Injectable } from "@angular/core";
import { DepartmentMaster } from "../Models/departmentMaster.model";
import { HttpService } from "../shared/http-service";
import { APIURLS } from "../shared/api-url";

@Injectable({
    providedIn: 'root'
})
export class DepartmentMasterService {
    departments: DepartmentMaster[] = [];
    isServiceLoading: boolean = false;

    constructor(private httpService: HttpService) {
        this.getDepartments();
    }

    private getDepartments() {
        this.isServiceLoading = true;
        
        this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: DepartmentMaster[]) => {
            if (data.length > 0) {
                this.departments = data.filter(x => x.isActive == true).sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
            }
            
            this.isServiceLoading = false;
        }).catch(error => {
            console.log(error);
            this.departments = [];
            
            this.isServiceLoading = false;
        });
    }
}