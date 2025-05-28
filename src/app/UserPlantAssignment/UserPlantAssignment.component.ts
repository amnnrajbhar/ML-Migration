import { AuthData } from './../auth/auth.model';
import { AppComponent } from './../app.component';
import { User } from './../masters/user/user.model';
import { APIURLS } from './../shared/api-url';
import { HttpService } from './../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { UserPlantAssignment } from './UserPlantAssignment.model';
import swal from 'sweetalert';
import * as _ from "lodash";
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-UserPlantAssignment',
  templateUrl: './UserPlantAssignment.component.html',
  styleUrls: ['./UserPlantAssignment.component.css']
})
export class UserPlantAssignmentComponent implements OnInit {

  public tableWidget: any;
  EmpList!: any[];
  formData: FormData = new FormData();
  file!: File;
  LocationList!: any[];
  selectedformItems = [];
  deletedformItems = [];
  formMainList!: any[];
  selectedformIds=[];
  selectedOldList=[];
  isLoading: boolean = false;
  proItem: UserPlantAssignment = new UserPlantAssignment(0, 0,0,0,'','','', true, this.selectedformItems, this.deletedformItems);;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path:string = '';
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#addProfile');
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
     // this.getEmpList();
     
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  
  ngAfterViewInit() {
    this.initDatatable()
  }

  closeModal() {
    ////console.log('testpop')
    jQuery("#myModal").modal('hide');
    
    // window.location.reload();
  }
  closeSaveModal() {
    ////console.log('testpop')
    jQuery("#saveModal").modal('hide');
    
    // window.location.reload();
  }
  UnlockuserList:any[]=[];
  EmployeeID:string='';
  getUnlockuserMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_MASTER_LOCKOUT_BY_PARAM_API,this.EmployeeID).then((data: any) => {
      if (data.length > 0) {
        this.UnlockuserList = data.filter((x:any)  => x.isActive).sort((a:any,b:any)=>{
                                    if(a.name > b.name) return 1;
                                    if(a.name < b.name) return -1;
                                    return 0;
                                });
      }
      else{
        swal({
          title: "No Employee found, Please check employeeId",
          icon: "warning",
          dangerMode: true,
          buttons: [false, true],
        })
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.UnlockuserList = [];
    });
  }

  locid:any;
  onAddProfile(isEdit: boolean, data: any) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.getLocationList();
    if (this.isEdit) {
     // this.locid=data.baseLocation;
      this.proItem = data;
      //this.getProMainListtoFilter(data.id);
    }
    else {
      this.proItem = new UserPlantAssignment(0, 0,0,0,'','','', true, this.selectedformItems, this.deletedformItems);;
      
    }
    jQuery("#myModal").modal('show');
  }
  showFormsAssigned(isEdit: boolean, data: UserPlantAssignment) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.FormsAssignedList=[];
    this.getLocationList();
    if (this.isEdit) {
      this.proItem = data;
      //this.getProMainListtoFilter(data.id);
    }
    else {
      this.proItem = new UserPlantAssignment(0, 0,0,0,'','','', true, this.selectedformItems, this.deletedformItems);;
      
    }
    jQuery("#formModal").modal('show');
  }

  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      this.isLoading = false;
      if (data.length>0) {
        this.LocationList = data;
        this.LocationList=this.LocationList.filter((x:any)=>x.code !=null);
        this.LocationList.forEach((item :any) => { item.isChecked = false; });
        this.formMainList = this.LocationList;
        if(this.isEdit){
          this.getProMainListtoFilter(this.proItem.id);
         
        }
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.LocationList = [];
    });
  }

  getEmpList() {
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.EmpList = data;
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.EmpList = [];
    });
  }

  getEmpList1()
  {
    this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS,this.EmployeeID).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.EmpList = data;
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.EmpList = [];
    });
  }

  FormsAssignedList:any=[]=[];
 




  // getProMainListtoFilter(pid: number) {
  //   debugger;
  //   this.httpService.getById(APIURLS.BR_MASTER_PROFILE_API_BYID, pid).then((data: any) => {
  //     debugger;
  //     if (data.length > 0) {
  //       debugger;
  //       this.LocationList = data;
  //       this.formMainList = data;
  //       this.LocationList.forEach(function (item) {
  //         if (item.isChecked == true)
  //           item.isChecked = true;
  //         else
  //           item.isChecked = false;
  //       });
  //     }
  //   }).catch((error)=> {
  //     this.LocationList = [];
  //   });
  // }

  getProMainListtoFilter(pid: number) {
    this.httpService.get(APIURLS.BR_MASTER_USER_PLANT_MAINT_API).then((data: any) => {
      if (data.length > 0) {
        this.selectedformIds = _.filter(data, function (obj) { if(obj.fkEmpId==pid) return obj;});
        this.selectedOldList=this.selectedformIds;
        for(var i=0;i<this.selectedformIds.length;i++){
          this.LocationList.find(item => item.id == this.selectedformIds[i].fkPlantId).isChecked = true;
        }
       // this.LocationList.find(item => item.id == this.locid).isChecked = true;
       // this.DisplayFormsAssigned();
      }
    }).catch((error)=> {
      this.LocationList = [];
    });
  }

  checkAllForm(check: boolean) {
    this.LocationList.forEach((item :any) => { item.isChecked = this.checkAll; });
  }

  onSaveProfile() {
    this.errMsg = "";
    this.errMsgPop = "";
    
    this.selectedformItems = _.filter(this.LocationList, function (obj) { return obj.isChecked; });
    this.proItem.pro_delList = this.deletedformItems;
    this.proItem.pro_formList = this.selectedformItems; 
    let connection: any;  
    this.isLoadingPop = true;
    if (this.selectedformItems.length>0) {
      var retData=this.saveProfileMaintFullList();
      if(retData=='200'){
        // debugger;
        this.deleteProfileMaintFullList();
      }
      jQuery("#myModal").modal('hide');
      this.errMsgPop1 = ' Plant assignment saved successfully!';
      jQuery("#saveModal").modal('show');
      this.getEmpList1();
    }
  }

  saveProfileMaintFullList(){
    var dataRet='';
    this.selectedformItems = _.filter(this.LocationList, function (obj) { return obj.isChecked; });
    this.proItem.pro_delList = this.deletedformItems;
    this.proItem.pro_formList = this.selectedformItems;
    
    let newProfileMainItem:any={};
    for(var i=0;i<this.selectedformItems.length;i++){
      // debugger;
      dataRet='200';
      // debugger;
      if(!this.selectedOldList.find(item => item.fkPlantId == this.selectedformItems[i].id)){
        // debugger;
        newProfileMainItem={id:0,fkPlantId:this.selectedformItems[i].id,fkEmpId:this.proItem.id,createdBy:0,createdDate:new Date(),modifiedBy:0,modifiedDate:new Date(),isActive:true};
        // debugger;
        let connection: any;
        connection = this.httpService.post(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_BYID, newProfileMainItem);
        connection.then((data: any) => {
          // debugger;
          this.isLoadingPop = false;
          if (data == 200) {
            // debugger;
            dataRet=data;
          }
          else {
            this.errMsgPop = 'Error adding form data...';
          }
        }).catch((error)=> {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error adding form data..';
        });
      }
      
    }
    return dataRet;
    //newProfileMainItem={id:0,fkFormId:id,fkProfileId:this.proItem.id,createdBy:0,createdDate:new Date(),modifiedBy:0,modifiedDate:new Date(),isActive:true};
    
  }

  deleteProfileMaintFullList(){
    //var delId=this.selectedformIds.find(item => item.fkFormId == id).id;
    // debugger;
    var delIds=0;
    for(var i=0;i<this.deletedformItems.length;i++){
      delIds=this.deletedformItems[i];
      let connection: any;
      connection = this.httpService.delete(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_BYID, delIds);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          // debugger;
        }
        else {
          this.errMsgPop = 'Error adding form data...';
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error adding form data..';
      });
      }
    
  }

  checkFormItem(isChecked: boolean, form: any) {
    var delId=this.selectedformIds.find(item => item.fkPlantId == form.id);
    if (delId!=undefined && !isChecked) {
      this.deletedformItems.push(delId.id);
      //if (this.selectedformIds.find((x:any)  => x.id == delId)) {
        this.selectedformIds.splice(this.selectedformIds.findIndex((x:any)  => x.id == delId.id), 1);
      //}
      //this.selectedformIds.reduce (delId);
      //this.deleteProfileMaintList(delId);
    }
    if (isChecked) {
      //this.saveProfileMaintList(form.id);
      form.isChecked = true;
    }
    else {
      form.isChecked = false;
    }
  }
}
