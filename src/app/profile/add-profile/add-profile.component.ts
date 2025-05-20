import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { User } from './../../masters/user/user.model';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { AddProfile } from './add-profile.model';
import * as _ from "lodash";
import { Router } from '@angular/router';
declare var jQuery: any;
declare var toastr: any;


@Component({
  selector: 'app-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.css']
})
export class AddProfileComponent implements OnInit {

  currentUser: AuthData;
  public tableWidget: any;
  profileList: any[];
  formData: FormData = new FormData();
  file: File;
  formList: any[];
  selectedformItems = [];
  deletedformItems = [];
  formMainList: any[];
  selectedformIds = [];
  selectedOldList = [];
  isLoading: boolean = false;
  proItem: AddProfile = new AddProfile(0, '', '', 0, 0, 0, true, this.selectedformItems, this.deletedformItems);;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  permissionMasterList: any[];
  item: any = {};
  selectedProfilePermissionList = [];

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      ////console.log(chkaccess);
      this.getProfileList();
      this.getPermissionMasterList();
      this.getProfilePermissionList();
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

  onAddProfile(isEdit: boolean, data: AddProfile) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.getFormList();
    if (this.isEdit) {
      this.proItem = data;
      //this.getProMainListtoFilter(data.id);
    }
    else {
      this.proItem = new AddProfile(0, '', '', 0, 0, 0, true, this.selectedformItems, this.deletedformItems);;

    }
    jQuery("#myModal").modal('show');
  }

  showFormsAssigned(isEdit: boolean, data: AddProfile) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    this.FormsAssignedList = [];
    this.getFormList();
    if (this.isEdit) {
      this.proItem = data;
      //this.getProMainListtoFilter(data.id);
    }
    else {
      this.proItem = new AddProfile(0, '', '', 0, 0, 0, true, this.selectedformItems, this.deletedformItems);;

    }
    jQuery("#formModal").modal('show');
  }


  getFormList() {
    this.httpService.get(APIURLS.BR_MASTER_FORM_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.formList = data;
        this.formList.forEach(item => { item.isChecked = false; });
        this.formMainList = this.formList;
        if (this.isEdit) {
          this.getProMainListtoFilter(this.proItem.id);
        }
        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.formList = [];
    });
  }

  getProfileList() {
    this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.profileList = data;
        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.profileList = [];
    });
  }

  FormsAssignedList: any = [] = [];
  DisplayFormsAssigned() {
    this.FormsAssignedList = this.formList.filter(x => x.isChecked == true);
  }




  // getProMainListtoFilter(pid: number) {
  //   debugger;
  //   this.httpService.getById(APIURLS.BR_MASTER_PROFILE_API_BYID, pid).then((data: any) => {
  //     debugger;
  //     if (data.length > 0) {
  //       debugger;
  //       this.formList = data;
  //       this.formMainList = data;
  //       this.formList.forEach(function (item) {
  //         if (item.isChecked == true)
  //           item.isChecked = true;
  //         else
  //           item.isChecked = false;
  //       });
  //     }
  //   }).catch(error => {
  //     this.formList = [];
  //   });
  // }

  getProMainListtoFilter(pid: number) {
    this.httpService.get(APIURLS.BR_MASTER_PROFILE_FORM_MAINT_API).then((data: any) => {
      if (data.length > 0) {
        this.selectedformIds = _.filter(data, function (obj) { if (obj.fkProfileId == pid) return obj; });
        this.selectedOldList = this.selectedformIds;
        for (var i = 0; i < this.selectedformIds.length; i++) {
          this.formList.find(item => item.id == this.selectedformIds[i].fkFormId).isChecked = true;
        }
        this.DisplayFormsAssigned();
      }
    }).catch(error => {
      this.formList = [];
    });
  }

  checkAllForm(check: boolean) {
    this.formList.forEach(item => { item.isChecked = this.checkAll; });
  }

  onSaveProfile() {
    this.errMsg = "";
    this.errMsgPop = "";

    this.selectedformItems = _.filter(this.formList, function (obj) { return obj.isChecked; });
    this.proItem.pro_delList = this.deletedformItems;
    this.proItem.pro_formList = this.selectedformItems;



    let connection: any;
    if (!this.isEdit) {
      {
        if (this.profileList.find(x => x.name == this.proItem.name)) {
          this.errMsgPop = 'Profile Name already exist'
        }
        else {
          this.isLoadingPop = true;
          connection = this.httpService.post(APIURLS.BR_MASTER_PROFILE_API_BYID, this.proItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.id > 0) {
              jQuery("#myModal").modal('hide');

              this.errMsgPop1 = ' Profile data saved successfully!';
              jQuery("#saveModal").modal('show');
              this.getProfileList();
            }
          }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving profile data..';
          });
        }
      }
    }
    else {
      if (this.profileList.find(x => x.name == this.proItem.name && x.id != this.proItem.id)) {
        this.errMsgPop = 'Profile Name already exist'
      }
      else {
        this.isLoadingPop = true;
        connection = this.httpService.put(APIURLS.BR_MASTER_PROFILE_API_BYID, this.proItem.id, this.proItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200) {
            var retData = this.saveProfileMaintFullList();
            if (retData == '200') {
              // debugger;
              this.deleteProfileMaintFullList();
            }
            jQuery("#myModal").modal('hide');
            this.errMsgPop1 = ' Profile data saved successfully!';
            jQuery("#saveModal").modal('show');
            this.getProfileList();
          }
          else {
            this.errMsgPop = 'Error saving profile data...';
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving profile data..';
        });
      }
    }


  }

  saveProfileMaintFullList() {
    var dataRet = '';
    let newProfileMainItem: any = {};
    for (var i = 0; i < this.selectedformItems.length; i++) {
      // debugger;
      dataRet = '200';
      // debugger;
      if (!this.selectedOldList.find(item => item.fkFormId == this.selectedformItems[i].id)) {
        // debugger;
        newProfileMainItem = { id: 0, fkFormId: this.selectedformItems[i].id, fkProfileId: this.proItem.id, createdBy: 0, createdDate: new Date(), modifiedBy: 0, modifiedDate: new Date(), isActive: true };
        // debugger;
        let connection: any;
        connection = this.httpService.post(APIURLS.BR_MASTER_PROFILE_FORM_MAINT_API_BYID, newProfileMainItem);
        connection.then((data: any) => {
          // debugger;
          this.isLoadingPop = false;
          if (data == 200) {
            // debugger;
            dataRet = data;
          }
          else {
            this.errMsgPop = 'Error adding form data...';
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error adding form data..';
        });
      }

    }
    return dataRet;
    //newProfileMainItem={id:0,fkFormId:id,fkProfileId:this.proItem.id,createdBy:0,createdDate:new Date(),modifiedBy:0,modifiedDate:new Date(),isActive:true};

  }

  deleteProfileMaintFullList() {
    //var delId=this.selectedformIds.find(item => item.fkFormId == id).id;
    // debugger;
    var delIds = 0;
    for (var i = 0; i < this.deletedformItems.length; i++) {
      delIds = this.deletedformItems[i];
      let connection: any;
      connection = this.httpService.delete(APIURLS.BR_MASTER_PROFILE_FORM_MAINT_API_BYID, delIds);
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          // debugger;
        }
        else {
          this.errMsgPop = 'Error adding form data...';
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error adding form data..';
      });
    }

  }

  checkFormItem(isChecked: boolean, form: any) {
    var delId = this.selectedformIds.find(item => item.fkFormId == form.id);
    if (delId != undefined && !isChecked) {
      this.deletedformItems.push(delId.id);
      //if (this.selectedformIds.find(x => x.id == delId)) {
      this.selectedformIds.splice(this.selectedformIds.findIndex(x => x.id == delId.id), 1);
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



  getPermissionMasterList() {
    this.httpService.HRget(APIURLS.BR_PROFILE_PERMISSION_GET_PERMISSION_MASTER).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.permissionMasterList = data;        
      }
    }).catch(error => {
      this.isLoading = false;
      this.permissionMasterList = [];
    });
  }

  profilePermissionList: any[];
  getProfilePermissionList() {
    this.httpService.HRget(APIURLS.BR_PROFILE_PERMISSION_GET_ALL).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.profilePermissionList = data;
        //this.profilePermissionListFiltered = data.filter(x => x.profileId == this.proItem.id);        
      }
    }).catch(error => {
      this.isLoading = false;
      this.profilePermissionList = [];
    });
  }

  profilePermissionListFiltered: any[];
  onAddEditPermission(isEdit: boolean, data: AddProfile) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
       this.proItem = data;
    this.profilePermissionListFiltered = this.profilePermissionList.filter(x => x.profileId == this.proItem.id);
    for (var item of this.permissionMasterList) {
      if (this.profilePermissionListFiltered.find(x => x.permissionId == item.id) != null)
        item.selected = true;
      else
        item.selected = false;
    }
    jQuery("#myPermissionModal").modal('show');
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return (d1.getFullYear() +"-"+ ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +("00" + d1.getDate()).slice(-2));
  }

  onSaveProfilePermissions() {
    this.isLoadingPop = false;
    toastr.info("Saving...");
    console.log(this.permissionMasterList);

    
    var filteredList = this.permissionMasterList.filter(x => x.selected == true);
    this.selectedProfilePermissionList = filteredList.map(function (a) { return a.id });
    console.log(this.selectedProfilePermissionList);
    var dataRet = '';
    let newProfilePermission: any = {};
    newProfilePermission = { profileId: this.proItem.id, permissionId: 0, profilePermissionId: 0, permissionIds: this.selectedProfilePermissionList, createdById: this.currentUser.uid, createdDate: this.setDateFormate(new Date()), modifiedById: this.currentUser.uid, modifiedDate: this.setDateFormate(new Date()) };
    let connection: any;
    connection = this.httpService.HRpost(APIURLS.BR_PROFILE_PERMISSION_ADDORUPDATE, newProfilePermission);
    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data == 200 || data.success) {
        dataRet = data;
        toastr.success("Successfully saved the details.");
        jQuery("#myPermissionModal").modal('hide');
      }
      else {
        toastr.error("Some error occurred.");
      }
    }).catch(error => {
      this.isLoadingPop = false;
      toastr.error("Some error occurred.");
    });
    return dataRet;
  }
}
