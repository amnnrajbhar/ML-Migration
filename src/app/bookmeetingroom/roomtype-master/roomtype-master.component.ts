import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { RoomType } from './roomtype.model';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-roomtype-master',
  templateUrl: './roomtype-master.component.html',
  styleUrls: ['./roomtype-master.component.css']
})
export class RoomtypeMasterComponent implements OnInit {
@ViewChild(NgForm, { static: false }) meetingroomForm: NgForm;

  currentUser = {} as AuthData;
  urlPath: string = '';
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoadingPop: boolean = false;
  isLoading: boolean;
  roomTypeModel = {} as RoomType;
  roomsTypeList: RoomType[] = [];
  tableWidget: any;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getAllroomsTypes();
    }
  }
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    let exampleId: any = jQuery('#roomsTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }
  getAllroomsTypes() {
    this.httpService.get(APIURLS.BR_MASTER_ROOMTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsTypeList = data;
      }
      this.reInitDatatable();
    }).catch(error => {
      this.roomsTypeList = [];
    });
  }

  onaddnewRoomType(isedit:boolean,roomType:RoomType): void {
    this.isEdit=isedit;
    this.roomTypeModel = {} as RoomType;
    this.errMsgPop = '';
    this.meetingroomForm.form.markAsPristine();
    this.meetingroomForm.form.markAsUntouched();
    this.meetingroomForm.form.updateValueAndValidity();
    if (isedit) {
      this.roomTypeModel = Object.assign({},roomType);
    }
    jQuery("#myModal").modal('show');
  }

  onSaveRoomType(): void {
    let connection:any;
    this.roomTypeModel.isActive = true;
    let sametype = this.roomsTypeList.some(v => v.type.toLowerCase() == this.roomTypeModel.type.toLowerCase() && v.id!=this.roomTypeModel.id);
    if (sametype) {
      this.isLoadingPop = false;
      this.errMsgPop = 'Type already exists..';
    }
    else {
      if (!this.isEdit) {
        this.roomTypeModel.createdBy = this.currentUser.uid;
        this.roomTypeModel.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_MASTER_ROOMTYPE_API, this.roomTypeModel);
      }
      else {
        this.roomTypeModel.modifiedBy = this.currentUser.uid;
        this.roomTypeModel.modifiedDate = new Date().toLocaleString();
        connection = this.httpService.put(APIURLS.BR_MASTER_ROOMTYPE_API, this.roomTypeModel.id, this.roomTypeModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
       // console.log(data);
        if (data == 200 || data.id > 0) {
         // console.log(data);
          jQuery('#myModal').modal('hide');
          this.errMsgModalPop = 'Type saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getAllroomsTypes();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Room Type..';
      });
    }
  }
}
