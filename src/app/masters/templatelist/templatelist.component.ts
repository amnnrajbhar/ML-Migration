import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { TemplateList } from './templatelist.model';
import * as _ from "lodash";
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-templatelist',
  templateUrl: './templatelist.component.html',
  styleUrls: ['./templatelist.component.css']
})
export class TemplateListComponent implements OnInit {

    public tableWidget: any;
    country_name: string = "";
    stateList: any[];
    SelState: any;
    ApprovalTemplateName ="";
    isDispHide: boolean = true;
    selectedtempVal1: string="";
    selectedtempVal2: string="";
    getapproval:any[];
    templateList1: any[] =[];
    templateListSel1: any[];
    templateListSel2: any[];
    hdrMappedList1: any[]=[];
    hdrMappedList2: any[]=[];
    templateList2: any[];
    templateItem: any;
    projectList:any[];
    approvalItem: TemplateList  = new TemplateList(0,"","","",0,0,"","");
    sbuLst:any[];
    isLoading: boolean = false;
    tempHeaderList: any[];
    errMsg: string = "";
    errMsgPAN: string = "";
    errMsgGSTIN: string = "";
    isLoadingPop: boolean = false;
    isValidgstin: boolean = false;
    errMsgPop: string = "";
    //regDate: Date = new Date();
    isEdit: boolean = false;
    path:string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#customerTable');
        this.tableWidget = exampleId.DataTable();
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy()
            this.tableWidget = null
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    ngOnInit() {
        this.path = this.router.url;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if(chkaccess == true){
            ////console.log(chkaccess);
            this.getApprovalList();
        }
        else 
            this.router.navigate(["/unauthorized"]);
    }

    ngAfterViewInit() {
        this.reInitDatatable()
    }

    getApprovalList()    {
        this.errMsg = "";
        this.isLoading = true;
        // debugger;
        this.httpService.get(APIURLS.BR_MASTER_APPROVALTEMPLATE_API_ALL).then((data: any) => {
            ////console.log(data);
            this.isLoading = false;
            this.getapproval = data;
            this.reInitDatatable();
            }).catch(error => {
            this.isLoading = false;
            this.getapproval = [];
           
        });
    }

 
}
