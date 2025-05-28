import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { TdTypeOfEventMaster } from './TdTypeOfEventMaster.model';
import * as _ from "lodash";
//import { AuditLog } from 'src/app/masters/auditlog.model';
import { AuthData } from '../../auth/auth.model';

declare var jQuery: any;

@Component({
  selector: 'app-TdTypeOfEventMaster',
  templateUrl: './TdTypeOfEventMaster.component.html',
  styleUrls: ['./TdTypeOfEventMaster.component.css']
})
export class TdTypeOfEventMasterComponent implements OnInit {

  @ViewChild(NgForm, { static: false }) TdTypeOfEventMasterForm!: NgForm;

  public tableWidget: any;
  id!: number;
  TdTypeOfEventMasterList: TdTypeOfEventMaster[] = [];
  TdTypeOfEventMasterItem: TdTypeOfEventMaster = new TdTypeOfEventMaster();
  isLoading: boolean = false;
  entityTabHeader: string
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
    masterName: string
    reinitPOUPDatatable: any;
    isActive!: boolean;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#TdTypeOfEventMasterTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    this.isLoading = false;
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }
  
  currentUser = {} as AuthData;
  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getTdTypeOfEventMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddTdTypeOfEventMaster(isEdit: boolean, data: TdTypeOfEventMaster) {
    this.TdTypeOfEventMasterForm.form.markAsPristine();
    this.TdTypeOfEventMasterForm.form.markAsUntouched();
    this.TdTypeOfEventMasterForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;

    if (this.isEdit) {
      Object.assign(this.TdTypeOfEventMasterItem, data);
    }
    else {
      this.TdTypeOfEventMasterItem = new TdTypeOfEventMaster();
    }
    jQuery("#myModal").modal('show');
  }

  getTdTypeOfEventMasterList() {
    this.httpService.get(APIURLS.BR_TDTYPEOFEVENT_MASTER_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.TdTypeOfEventMasterList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.TdTypeOfEventMasterList = [];
    });
  }

  onSaveTdTypeOfEventMaster() {
    this.errMsg = "";
    let connection: any;
    if (!this.TdTypeOfEventMasterList.some((s:any) => s.typeOfEvent.trim().toLowerCase() === this.TdTypeOfEventMasterItem.typeOfEvent.trim().toLowerCase() && s.id != this.TdTypeOfEventMasterItem.id)) {
      if (!this.isEdit)
       {
           if (this.TdTypeOfEventMasterItem.isActive == true)
           {
            this.TdTypeOfEventMasterItem.isActive= true;
           }
           else
           {
            this.TdTypeOfEventMasterItem.isActive= false;
           }
       
        this.TdTypeOfEventMasterItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.post(APIURLS.BR_TDTYPEOFEVENT_MASTER_POST_PUT_API, this.TdTypeOfEventMasterItem);
      }
        
      else
      {
        this.TdTypeOfEventMasterItem.createdBy = this.currentUser.employeeId;
        connection = this.httpService.put(APIURLS.BR_TDTYPEOFEVENT_MASTER_POST_PUT_API, this.TdTypeOfEventMasterItem.id, this.TdTypeOfEventMasterItem);

      }

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Type Of Event master saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getTdTypeOfEventMasterList();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving type of event data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Entered type of event already exists';
    }
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

}
