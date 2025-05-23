import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { User } from './../../masters/user/user.model';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Department } from './department.model';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
declare var jQuery: any;

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class SoftSkillComponent implements OnInit {
    
    public tableWidget: any;
    depList: any[];
    parentList: any[];
    selParentRole: any;
    depItem: Department = new Department(0, '','', '', 0, 0,'',true);;
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient) { }

    private initDatatable(): void {
      let exampleId: any = jQuery('#department');
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
      ////console.log("coming here");

        this.getDepartList();
    }
    ngAfterViewInit() {
        this.initDatatable()
    }

    onAddDepart(isEdit: boolean, data: Department) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.depItem = data;
        this.parentList = this.depList.filter(s => s.isActive != false);
        this.selParentRole = this.depList.find(s => s.id === this.depItem.fkProfileId);
      }
      else {
        this.parentList = this.depList.filter(s => s.isActive != false);;
        this.depItem = new Department(0, '','', '', 0,0,'', true);
        this.selParentRole = null;
      }
      jQuery("#myModal").modal('show');
    }
   getHeader(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
  
    getDepartList() {
     
      this.httpService.get(APIURLS.BR_MASTER_SOFTSKILL_DATA_API).then((data: any) => {
        this.isLoading = false;
        if (data.length >0) {
          this.depList = data;
          
// this.depList.forEach(element => {
//             element.parentName = '';
//             element.parentName = this.depList.find(x => x.id == element.fkParentId)['name'];
//           });

          // this.depList.forEach(item =>{item.name = (this.depList.find(x => x.id == item.fkParentId)['name'])});
        
          // var depListUpdated = [];
          // this.depList.forEach(element => {
          //   element.parentName = '';
          //   element.parentName = this.depList.find(x => x.id == element.fkParentId)['name'];
          //   depListUpdated.push(element);
          // });
          // this.depList = depListUpdated;
          //this.parentList = data.roleList;
          //this.roleList.forEach(item => { item.isChecked = false; });
          this.reInitDatatable();
        }
      }).catch(error => {
        this.isLoading = false;
        this.depList = [];
      });
    }
    onSaveDepart() {
      debugger;
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.depItem.fkProfileId = this.selParentRole.id;
      let connection: any;
      debugger;
      // if (!this.isEdit)
      //   connection = this.http.post(APIURLS.BR_BASE_URL+ APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem, this.getHeader());
      // else
      //   connection = this.http.put(APIURLS.BR_BASE_URL+ APIURLS.BR_MASTER_DEPARTMENT_API_INSERT+"/" +this.depItem.id, this.depItem, this.getHeader())
      //   .subscribe(response => {
      //       debugger;
      //       // You can access status:
      //       ////console.log(response.status);
      //       ////console.log(response);
      //       if (response.status == 200) {
      //         this.isLoadingPop = false;
      //         jQuery("#myModal").modal('hide');
      //         this.getDepartList();
      //       }
      //       else {
      //         this.isLoadingPop = false;
      //         this.errMsgPop = 'Error saving department data..';
      //       }
  
      //      // Or any other header:
      //       ////console.log(response.headers.get('X-Custom-Header'));
      //     });
  
       // let connection: any;
        if (!this.isEdit)
         connection = this.httpService.post(APIURLS.BR_MASTER_SOFTSKILL_API, this.depItem);
        else
         connection = this.httpService.put(APIURLS.BR_MASTER_SOFTSKILL_API, this.depItem.id, this.depItem);
            connection.then((data: any) => {
         this.isLoadingPop = false;
         if (data == 200) {
           jQuery("#myModal").modal('hide');
           this.getDepartList();
         }
         else {
           this.errMsgPop = 'Error saving department data..';
         }
        }).catch(error => {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving department data..';
        });
      }
  
  



    // onSaveDepart() {
    //   this.errMsg = "";
    //   this.errMsgPop = "";
    //   this.isLoadingPop = true;
    //   this.depItem.fkParentId = this.selParentRole.id;
    //   let connection: any;
    //   if (!this.isEdit)
    //     connection = this.httpService.post(APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem);
    //   else
    //     connection = this.httpService.put(APIURLS.BR_MASTER_DEPARTMENT_API_INSERT, this.depItem.id, this.depItem, );
    //       connection.then((data:any ) => {
    //         debugger;
    //         this.isLoadingPop = false;
    //         if (data.length > 0) {
    //           jQuery("#myModal").modal('hide');
    //           this.getDepartList();
    //         }
    //         else 
    //           this.errMsgPop = data;
            
    //       }).catch(error => {
    //         this.isLoadingPop = false;
    //         this.errMsgPop = 'Error saving department data..';
    //       });
    //     }
  

}
