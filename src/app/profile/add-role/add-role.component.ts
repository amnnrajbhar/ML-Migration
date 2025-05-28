import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { User } from './../../masters/user/user.model';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Role } from './add-role.model';
import * as _ from "lodash";
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
    
    public tableWidget: any;
    roleList!: any[];
    roleList1!: any[];
    parentList!: any[];
    selParentRole: any;
    roleItem: Role = new Role(0, '', '', 0,'','',true);;
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    path:string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#addRole');
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
        this.getRoleList();
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
    onAddRole(isEdit: boolean, data: Role) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.roleItem = data;
        this.parentList = this.roleList.filter((s:any) => s.isActive != false);
        this.selParentRole = this.roleList.find((s:any) => s.role === this.roleItem.role);
      }
      else {
        this.parentList = this.roleList.filter((s:any) => s.isActive != false);
        this.roleItem = new Role(0, '', '', 0, '', '', true);
        this.selParentRole = null;
      }
      jQuery("#myModal").modal('show');
    }

    getRoleList() {
      this.httpService.get(APIURLS.BR_MASTER_ROLE_API).then((data: any) => {
        this.isLoading = false;
        if (data.length >0) {
          this.roleList = data;
          for(let des of this.roleList) {
            this.httpService.getById(APIURLS.BR_MASTER_ROLE_API_BYID, des.fkSuperRoleId).then((datam:any) => {
            this.roleItem = datam;
            
           });  
          }
          //this.parentList = data.roleList;
          //this.roleList.forEach((item :any) => { item.isChecked = false; });
          this.reInitDatatable();
        }
      }).catch((error)=> {
        this.isLoading = false;
        this.roleList = [];
      });
    }
    getRoleName(id:number){
      var temp: any;
      temp = this.roleList.find((s:any) => s.id == id);
      var fiscalname = (typeof temp != 'undefined')? temp.role : '';
      return fiscalname;
      // this.roleList.find((s:any) => s.fkSuperRoleId === this.roleItem.id)['fkSuperRoleId'] = this.roleItem.role;
    }
    onSaveRole() {
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.roleItem.fkSuperRoleId = this.selParentRole.id;
      let connection: any;
      if (!this.isEdit)
      {
        connection = this.httpService.post(APIURLS.BR_MASTER_ROLE_API_BYID, this.roleItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data.id>0) {
            jQuery("#myModal").modal('hide');
            
 this.errMsgPop1 = ' Role data saved successfully!';
 jQuery("#saveModal").modal('show');

            this.getRoleList();
          }
          else {
            this.errMsgPop = data;
          }})
      }
      else
        connection = this.httpService.put(APIURLS.BR_MASTER_ROLE_API_BYID, this.roleItem.id, this.roleItem);
       
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200) {
          jQuery("#myModal").modal('hide');
          
 this.errMsgPop1 = 'Role data saved successfully!';
 jQuery("#saveModal").modal('show');

          this.getRoleList();
        }
        // else {
        //   this.errMsgPop = data;
        // }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving role data..';
      });
    }

}
