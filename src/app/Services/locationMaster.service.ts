import { Injectable } from "@angular/core";
import { LocationMaster } from "../Models/locationMaster.model";
import { HttpService } from "../shared/http-service";
import { APIURLS } from "../shared/api-url";

@Injectable({
    providedIn: 'root'
})
export class LocationMasterService {
    locations: LocationMaster[] = [];
    assignedLocations: LocationMaster[] = [];

    isServiceLoading: boolean = false;

    constructor(private httpService: HttpService) {
        this.getLocations();
    }

    findLocationByID(id: number): LocationMaster {
        return this.locations.find(x => x.id == id);
    }

    findLocationByCode(code: string): LocationMaster {
        return this.locations.find(x => x.code == code);
    }

    getAssignedLocations(employeeID: string) {
        this.httpService.getByParam(APIURLS.BR_LOCATIONMASTER_GETASSIGNEDPLANTS, employeeID).then((data: LocationMaster[]) => {
            if (data.length > 0) {
                this.assignedLocations = data.filter(x => x.isActive == true).sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });

                this.assignedLocations.forEach(element => {
                    element.displayName = element.code + " - " + element.name;
                });
            }
        }).catch(error => {
            console.log(error);
            this.locations = [];
        });
    }

    private getLocations() {
        this.isServiceLoading = true;

        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: LocationMaster[]) => {
            if (data.length > 0) {
                this.locations = data.filter(x => x.isActive == true).sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });

                this.locations.forEach(element => {
                    element.displayName = element.code + " - " + element.name;
                });
            }
            
            this.isServiceLoading = false;
        }).catch(error => {
            console.log(error);
            this.locations = [];
            
            this.isServiceLoading = false;
        });
    }
}