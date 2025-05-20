import { AuthData } from '../../auth/auth.model'
import { Employee } from './employee.model';
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class ApprovalEmployeeComponent implements OnInit {

    public tableWidget: any;
    dddivisionList: any[];
    entityList: any[];
    selParentRole: any;
    selDepartment: any;
    selProfile: any;
    roleList: any[];
    departmentList: any[];
    profileList: any[];
    userDivisionList: any[];
    FilteredDivList: any[];
    divSelectedItem: any[];
    entitySelectedItem: any[];
    userEntityList: any[];
    entitySelected=[];
    userList: Employee[];
    uid: number = 0;
    userItem: Employee = this.userItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true);
    isLoading: boolean = false;
    errMsg: string = "";
    hideDivisionElement: boolean = true;
    hideEntityElement: boolean = true;
    hideEntityTable: boolean = true;
    disableEntity: boolean = true;
    disableDivision: boolean = true;
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    errMsgPop: string = "";
    isEdit: boolean = false;
    constructor(private appService: AppComponent, private httpService: HttpService) { }


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
      this.getUserMasterList();
      this.getRoleList();
      this.getDepartList();
      this.getProfileList();
        //this.getEntityList();
        //this.getDivisionList();
        
    }
    ngAfterViewInit() {
        this.initDatatable()
    }


    getUserMasterList() {
        this.errMsg = "";
        this.isLoading = true;
        this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
            this.isLoading = false;
            if (data.length > 0) {
                this.userList = data;
                //this.dddivisionList = data.usr_dddivision.dddivisionList;
               // this.dddivisionList = null;
                //this.entityList = data.usr_ddentity.ddentityList;
                //this.entityList = [];//data.usr_ddentity.ddentityList;
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
        if (data.length>0) {
          this.roleList = data;
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
        if (data.status == 'SUCCESS') {
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
        if (data.status == 'SUCCESS') {
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

    onAddUser(isEdit: boolean, data: Employee) {
        this.isEdit = isEdit;
        this.errMsgPop = "";
        this.isLoadingPop = false;
        this.DisableAdd();
        //this.isLoadPop = false;
        if (this.isEdit) {
            this.userItem = data;
            this.getMappedEntity();
            // this.selParentRole = this.userItem.fkroleId!=0?this.roleList.find(s => s.id === this.userItem.roleId):null;
            this.selDepartment = this.userItem.fkDepartment!=0?(this.departmentList.find(s => s.id === this.userItem.fkDepartment)):null;
            // this.selProfile = this.userItem.profileId!=0?this.profileList.find(s => s.id === this.userItem.profileId):null;
            // this.userItem.fkSbu = null;
            // this.userItem.usr_divid = null;
            
            // this.userItem.reusr_pwd = this.userItem.usr_pwd;
            //this.onLevelChange(this.userItem.usr_level);
        }
        else {
            this.userItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true);
            this.getMappedEntity();
            //this.onLevelChange(this.userItem.usr_level);
            this.selParentRole = null;
            this.selDepartment = null;
            this.selProfile = null;
            // this.userItem.roleId = null;
            // this.userItem.usr_enid = null;
            // this.userItem.usr_divid = null;
            // this.userItem.reusr_pwd = this.userItem.usr_pwd;
        }
        jQuery("#myModal").modal('show');
    }
    
    // getDivisionList() {
    //     this.httpService.get(APIURLS.BR_DD_DIVISION_API).then((data: any) => {
    //         if (data.status == 'SUCCESS') {
                
    //             this.dddivisionList = data.dddivisionList;
    //             this.dddivisionList.push({ divid: 0, div_code: "All", div_name: "All" });
    //             this.dddivisionList.sort(e=>e.divid);
    //         }
    //     }).catch(error => {
    //         this.dddivisionList = [];
    //     });
    // }

    onSaveUser(status: boolean) {
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        // this.userItem.usr_enid = 0;
        // this.userItem.usr_divid = 0;
        let connection: any;
        if (this.userDivisionList == null ? this.userDivisionList == null : this.userDivisionList.length == 0) {
          this.errMsgPop = "Add entity and division"
          this.isLoadingPop = false;
        }
        else {
        if (!this.isEdit) {

            // this.userItem.usr_div = this.userItem.usr_div;
            // this.userItem.usr_entList = this.entitySelected;
            // this.userItem.usr_divList = this.userDivisionList;
            // this.userItem.roleId = this.selParentRole.id;
            // this.userItem.departmentId = this.selDepartment.id;
            // this.userItem.profileId = this.selProfile.id;
            // connection = this.httpService.post(APIURLS.BR_MASTER_USER_API, this.userItem);
          }
          else {
            // this.userItem.usr_entList = this.entitySelected;
            // this.userItem.usr_divList = this.userDivisionList;
            // this.userItem.roleId = this.selParentRole.id;
            // this.userItem.departmentId = this.selDepartment.id;
            // this.userItem.profileId = this.selProfile.id;
            connection = this.httpService.put(APIURLS.BR_MASTER_USER_API, this.userItem.id, this.userItem);
          }

          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.length > 0) {
              jQuery("#myModal").modal('hide');
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
    }
    
    
    onEntChange(item: any) {
      if (this.userDivisionList != null) {
        if (this.userDivisionList.find(e => e.enid == item.enid)) {
            }
        else {
              this.userDivisionList = this.userDivisionList.concat(this.entityList.find(e => e.enid == item.enid));
            }
        }
      else {
        this.userDivisionList = [];
        this.entitySelected = (this.entityList.filter(e => e.enid == item.enid));
        this.userDivisionList = this.entitySelected;
      }
      this.DisableAdd();
    }


    onEntityChange(item: any) {
        //if (this.userItem.usr_level == 3) {
            this.entitySelectedItem = item;
       // }
       // else if (this.userItem.usr_level == 4) {
            this.dddivisionList = null;
            this.httpService.getById(APIURLS.BR_DD_DIVISION_API, item.enid).then((data: any) => {
                if (data.status == 'SUCCESS') {
                    this.dddivisionList = data.dddivisionList;
                    this.dddivisionList.push({ divid: 0, div_code: "0", div_name: "Select All", enid:item.enid, en_name:item.en_name, en_code:item.en_code });
                    this.dddivisionList.sort(e => e.divid);
                    
                    //this.reInitDatatable();
                }
                else {
                  this.dddivisionList = null;
                }
            }).catch(error => {
                this.dddivisionList = [];
                });
            
            // this.userItem.usr_divid = null;
       // }
    }

    onDivisionChange(item: any) {
        this.divSelectedItem = item;
    }

    onDivChange(item: any) {
        if (item.divid == 0 && item.div_code == "0") {
           if (this.userDivisionList != null) {
               this.FilteredDivList = (this.dddivisionList.filter(e => e.enid == item.enid && e.divid != item.divid));
               this.userDivisionList = this.userDivisionList.filter(e=>e.enid!=item.enid);
               this.userDivisionList=this.userDivisionList.concat(this.FilteredDivList);
              
            }
            else {
               this.userDivisionList = (this.dddivisionList.filter(e => e.enid == item.enid && e.divid != item.divid));
           }
        }
        else if (this.userDivisionList != null) {
                if (this.userDivisionList.find(e => e.enid == item.enid && e.divid == item.divid)) {
                }
                else {
                    this.userDivisionList.push(this.dddivisionList.find(e => e.enid == item.enid && e.divid == item.divid));
                }
        }
            else {
            this.userDivisionList = (this.dddivisionList.filter(e => e.enid == item.enid && e.divid == item.divid));
            }
        this.DisableAdd();
    }

    onAddEntityDiv(userEnItem:any) {
      //if (userEnItem.usr_level == 3) {
      if (this.entitySelectedItem != null && this.dddivisionList.length == 0) {
        this.isLoadPop = false;
        this.onEntChange(this.entitySelectedItem);
      }
      //    let exampleId: any = jQuery('#userEntityTable');
      //    this.tableWidget = exampleId.DataTable();
      //    this.entitySelected;
      //    this.reInitDatatable();
      //    this.userItem.usr_enid = 0;
      //}
      //else if (userEnItem.usr_level == 4)
      //{
      else {
        if (this.divSelectedItem != null) {
          this.isLoadPop = false;
          this.onDivChange(this.divSelectedItem);
        }
        let exampleId: any = jQuery('#userDivisionTable');
        this.tableWidget = exampleId.DataTable();
        this.userDivisionList;
        this.reInitDatatable();
        //this.userItem.usr_divid = null;
      }
        //}
        //else {
        //    this.isLoadingPop = false;
        //    this.isLoadPop = false;
        //    this.userItem.usr_divid = 0;
        //    jQuery("#myModal").modal('show');
        //}
    }
    onDeleteUserEntity(item: number) {
        this.entitySelected=this.entitySelected.filter(e=>e.enid!=item);
        
    }
    onDeleteUserDivision(divid: number, enid: number) {
      var dividDel = divid;
      if (dividDel == null || dividDel==undefined) {
        this.userDivisionList = this.userDivisionList.filter(e => e.enid != enid);
        //this.entitySelected = this.entitySelected.filter(e => e.enid != enid);
      }
      else {
        this.userDivisionList = this.userDivisionList.filter(e => e.divid != divid);
      }
      this.DisableAdd();
        
    }

    getMappedEntity() {
        this.httpService.getById(APIURLS.BR_DD_USERDIVISION_API, this.userItem.id).then((data: any) => {
          if (data.status == 'SUCCESS') {
            if (data.userDivisionList == null) {
              //this.userDivisionList = data.userEntityList;
              if (data.userEntityList != null) {
                this.entitySelected = data.userEntityList;
                this.isLoadPop = false;
              }
              else {
                this.isLoadPop = true;
                this.userDivisionList = [];
              }
            }
            else 
            {
              this.userDivisionList = data.userDivisionList;
              this.entitySelected = data.userEntityList;
              if (data.userEntityList != null) {
                this.isLoadPop = false;
                this.userDivisionList = this.userDivisionList.concat(this.entitySelected);
              }
            }
                
                //this.userDivisionList.concat(data.userDivisionList);
            }
        }).catch(error => {
            this.userDivisionList = [];
        });
    }

    DisableAdd() {
      this.entitySelectedItem = null;
      this.divSelectedItem = null;
      // this.userItem.usr_enid = 0;
      // this.userItem.usr_divid = 0;
    }
}
