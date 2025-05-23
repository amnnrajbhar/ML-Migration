import { AuthData } from './../auth/auth.model';
import { AppComponent } from './../app.component';
import { User } from './../masters/user/user.model';
import { APIURLS } from './../shared/api-url';
import { HttpService } from './../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    
    public tableWidget: any;
    name: string = '';
    usrid: number;
    selParentRole: any;
    selDepartment: any;
    selProfile: any;
    roleList: any[];
    departmentList: any[];
    profileList: any[];
    dddivisionList: any[];
    selectedItems = [];
    SelValue: any[];
    userList: User[];
    userItem: User = new User(0, 0,'','','',0,0,0, '', 0, '', '', '', '', '', '', '','', '', 0, 0, false, '', '', false);;
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    //let authData: AuthData = "";
    path:string = '';
    constructor(private appService: AppComponent, private httpService: HttpService,  private router: Router) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#userTable');
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
        let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        this.usrid = authData.uid;
        this.getRoleList();
        this.getDepartList();
        this.getProfileList();
         this.getUserMasterList();
        }
        else 
          this.router.navigate(["/unauthorized"]);
      }
    ngAfterViewInit() {
        this.initDatatable()
    }
    closeSaveModal() {
        ////console.log('testpop')
        jQuery("#myModal").modal('hide');
        
        // window.location.reload();
      }

    getUserMasterList() {
        this.errMsg = "";
        this.isLoading = true;
        //connection = this.httpService.put(APIURLS.BR_MASTER_USER_API, this.userItem.uid, this.userItem);
        this.httpService.getById(APIURLS.BR_MASTER_USER_API, this.usrid).then((data: any) => {
            this.isLoading = false;
            if (data.length >0) {
              this.userItem = data.user;
              this.selParentRole = this.userItem.roleId != 0 ? this.roleList.find(s => s.id === this.userItem.roleId) : null;
              this.selDepartment = this.userItem.departmentId != 0 ? (this.departmentList.find(s => s.id === this.userItem.departmentId)) : null;
              this.selProfile = this.userItem.profileId != 0 ? this.profileList.find(s => s.id === this.userItem.profileId) : null;
                this.reInitDatatable();
            }
        }).catch(error => {
            this.isLoading = false;
            this.userList = [];
        });
    }

    getRoleList() {
      this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
        // this.isLoading = false;
        if (data.length >0) {
          this.roleList = data.roleList;
          //this.parentList = data.roleList;
          //this.roleList.forEach(item => { item.isChecked = false; });
          // this.reInitDatatable();
        }
      }).catch(error => {
        //this.isLoading = false;
        this.roleList = [];
      });
    }

    getDepartList() {
      this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
        // this.isLoading = false;
        if (data.length >0) {
          this.departmentList = data.departmentList;
          //this.parentList = data.roleList;
          //this.roleList.forEach(item => { item.isChecked = false; });
          //this.reInitDatatable();
        }
      }).catch(error => {
        // this.isLoading = false;
        this.departmentList = [];
      });
    }

    getProfileList() {
      this.httpService.get(APIURLS.BR_MASTER_PROFILE_API).then((data: any) => {
        //this.isLoading = false;
        if (data.length >0) {
          this.profileList = data.profileList;
          // this.formMainList = data.profileList.pro_formMainList.formMaintenanceList;
          //this.parentList = data.roleList;
          //this.roleList.forEach(item => { item.isChecked = false; });
          // this.reInitDatatable();
        }
      }).catch(error => {
        //this.isLoading = false;
        this.profileList = [];
      });
    }



    onAddUser(isEdit: boolean, data: User) {
        //debugger;
       // this.isEdit = isEdit;
        if (this.usrid!=null) {
            this.userItem = data;
            this.selectedItems = (this.userItem.usr_div.split(","));
            this.SelValue = this.selectedItems;
            this.selParentRole = this.userItem.roleId != 0 ? this.roleList.find(s => s.id === this.userItem.roleId) : null;
            this.selDepartment = this.userItem.departmentId != 0 ? (this.departmentList.find(s => s.id === this.userItem.departmentId)) : null;
            this.selProfile = this.userItem.profileId != 0 ? this.profileList.find(s => s.id === this.userItem.profileId) : null;
            //this.initialSelect();
        }
        else {
            this.userItem = new User(0, 0,'','','',0,0,0, '', 0, '', '', '', '', '', '', '','', '', 0, 0, false, '', '', false);
            this.SelValue = null;
            this.selParentRole = null;
            this.selDepartment = null;
            this.selProfile = null;
        }
        jQuery("#myModal").modal('show');
    }

    //initialSelect() {
    //    debugger;
    //    this.SelValue = this.selectedItems.map(function (name, key) {
    //        return {
    //            div_code: name
    //        }
    //    }); 
    //}
    getDivisionList() {
        this.httpService.get(APIURLS.BR_DD_DIVISION_API).then((data: any) => {
            if (data.length >0)
                this.dddivisionList = data.dddivisionList;
        }).catch(error => {
            this.dddivisionList = [];
        });
    }

    onSaveUser(status: boolean) {
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        //this.getSelectedValue();
        let connection: any;
        //if (!this.isEdit)
         //   connection = this.httpService.post(APIURLS.BR_MASTER_USER_API, this.userItem);
       // else
            connection = this.httpService.put(APIURLS.BR_MASTER_USER_API, this.userItem.uid, this.userItem);

        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Profile data saved successfully!';
                jQuery("#saveModal").modal('show');
                this.getUserMasterList();
            }
            else {
                this.errMsgPop = data;
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving user data..';
        });
    }

    getSelectedValue() {
        //debugger;
        var val = '';
        for (var i = 0; i < this.SelValue.length; i++) {
            if ((i == ((this.SelValue.length) - 1))) {
                val += this.SelValue[i];
            }
            else {
                val += this.SelValue[i] + ",";
            }
        }
        this.userItem.usr_div = val;

    }

    onStatusChange(uid: number) {
        this.errMsg = "";
        this.isLoading = true;
        this.httpService.delete(APIURLS.BR_MASTER_USER_API, uid).then((data: any) => {
            this.isLoading = false;
            if (data.length >0) {
                this.getUserMasterList();
            }
            else {
                this.errMsg = data;
            }
        }).catch(error => {
            this.isLoading = false;
            this.errMsg = 'Error saving user data..';
        });
    }

    onChange(item: any) {
        // debugger;
        var val = '';
        for (var i = 0; i < this.SelValue.length; i++) {
            if ((i == ((this.SelValue.length) - 1))) {
                val += this.SelValue[i].div_code;
            }
            else {
                val += this.SelValue[i].div_code + ",";
            }
        }
        this.userItem.usr_div = val;
    }
}
