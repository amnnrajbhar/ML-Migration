import { Injectable } from "@angular/core";
import { HttpService } from "../shared/http-service";

@Injectable({
    providedIn: 'root'
})
export class MSService {
    filterRequest: string = ' ';
    filterProduct: string = ' ';
    filterStatus: string = ' ';
    filterBrand: string = ' ';
    
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 60);
    to_date: any = this.today;

    maxFileSize: number = 25000000;
    maxFileSizeText: string = "25 MB";

    revertedToInitiatorText: string = "ReverttoInitiator";
    revertedToLastApproverText: string = "ReverttoLastApprover";

    // pageSize: any = 10;
	// pageNumber: any = 1;
	// totalCount!: number;
	// totalPages!: number;

    constructor (private httpService: HttpService) { }

    // File Validation
    checkSpecialCharactersInFileName(fileName: string): boolean {
        let pattern = new RegExp("[@!#\$%\^*+=\{\}\?\|,\&]");

        if (pattern.test(fileName)) {
            return false;
        }

        return true;
    }
}