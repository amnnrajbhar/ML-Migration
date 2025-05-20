import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Mail } from './mail.model';
import { HttpClientModule } from '@angular/common/http';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Employee } from '../employee/employee.model';
declare var jQuery: any;

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {
    
    public tableWidget: any;
    indexI: number = 0;
    emailList: any[];
    empList: any;
    dispErrTable: boolean = false;
    empMList: any[];
    successMsg: string = "";
    parentList: any[];
    employeeList: any[];
    selParentRole: any;
    selHeadEmpId: any;
    mailItem: Mail = this.mailItem = new Mail(0,0,'','','','','','','','','','','','', '','', 0,'', 0, '',true);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    formData: FormData = new FormData();
    file: File;
    constructor(private appService: AppComponent, private httpService: HttpService, private http:Http) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#department');
        this.tableWidget = exampleId.DataTable();
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0);
    }

    ngOnInit() {
        this.getEmailList();
        // this.getEmpList();
    }
    ngAfterViewInit() {
        this.initDatatable();
    }

    onAddEmailTemplate(isEdit: boolean, data: Mail) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        
        this.mailItem =data;
        // this.emailList = this.emailList.filter(s => s.isActive != false);
     
      }
      else {
        //this.mailItem =data;
        // this.emailList = this.emailList.filter(s => s.isActive != false);
      }

      jQuery("#myModal").modal('show');
    }
    getHeader(): any { 
      var headers = new Headers();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      headers.append("Authorization", "Bearer " + authData.token);
      let options = new RequestOptions({ headers: headers });
      return options;
    }
  



    getEmailList() {
      this.httpService.get(APIURLS.BR_MASTER_EMAILTEMPLATE_ALL_API).then((data: any) => {
        this.isLoading = false;
        if (data.length > 0) {
          this.emailList = data;
        this.reInitDatatable();
      }
      }).catch(error => {
        this.isLoading = false;
        this.emailList = [];
      });
    }
    onSaveEmailTemplate() {

      this.errMsg = '';
      this.errMsgPop = '';
      this.isLoadingPop = true;
      let connection: any;

        if (!this.isEdit) {
          connection = this.httpService.post(APIURLS.BR_MASTER_EMAILTEMPLATE_API, this.mailItem);
          
        }
        else {
         connection = this.httpService.put(APIURLS.BR_MASTER_EMAILTEMPLATE_API, this.mailItem.id, this.mailItem);
        }
        connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data > 0) {
          ////console.log(data);
          jQuery('#myModal').modal('hide');
          this.getEmailList();
          this.reInitDatatable();
        }
        else {
           this.errMsgPop = 'Error saving sbu data..';
        }
        }).catch(error => {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving sbu data..';
        });
      }

}
