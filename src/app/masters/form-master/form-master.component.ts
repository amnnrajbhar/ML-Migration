import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';

import * as _ from "lodash";
import { APIURLS } from '../../shared/api-url';
import { Form } from './form.model';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-form-master',
  templateUrl: './form-master.component.html',
  styleUrls: ['./form-master.component.css']
})
export class FormMasterComponent implements OnInit {

 
  public tableWidget: any;
  formList!: any[];
  parentList!: any[];
  selParentRole: any;
  formItem={} as Form;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path:string = '';
  constructor(private appService: AppComponent, private httpService: HttpService,  private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#formM');
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
      this.getFormMasterList();
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
      this.initDatatable();
  }

  onAddForm(isEdit: boolean, data: Form) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    if (this.isEdit) {
      this.formItem = data;
      this.parentList = this.formList.filter((s:any) => s.isActive != false);
      // this.selParentRole = this.formList.find((s:any) => s.id === this.formItem.fkParentId);
    }
    else {
      this.parentList = this.formList.filter((s:any) => s.isActive != false);;
      this.formItem = new Form(0, '', '', '','',0, 0, 0, 0, 0, true,0);
      this.selParentRole = null;
    }
    
    jQuery("#myModal").modal('show');
  }

  getFormMasterList() {
    // this.errMsg = "";
    // this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_FORM_API).then((data: any) => {
      // this.isLoading = false;  
      if (data.length >0) {
        this.formList = data;
        // this.isLoading = false;
        
      }
      this.reInitDatatable();
    }).catch((error)=> {
      this.isLoading = false;
      this.formList = [];
    });
    // this.httpService.get(APIURLS.BR_MASTER_FORM_API).then((data: any) => {
    //   this.isLoading = false;
    //   if (data.length > 0) {
    //     this.formList = data;
    //     this.reInitDatatable();
    //   }
    //   else 
    //   this.errMsgPop = data;
    // }).catch((error)=> {
    //   this.isLoading = false;
    //   this.formList = [];
    // });
  }
//code added by Ramesh
  formdisplaylist=[
    {id:0 ,name:'ALL'},
    {id:1 ,name:'GXP'},
    {id:2 ,name:'NON-GXP'},
  ]
  Moduletype(id)
  {
   let temp= this.formdisplaylist.find(x=>x.id ==id);
   return temp ?temp.name:'';
  }
  
  onSaveFormMaster() {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    // this.formItem.fkParentId = this.selParentRole.id;
    let connection: any;
    if (!this.isEdit)
      connection = this.httpService.post(APIURLS.BR_MASTER_FORM_INSERT_API, this.formItem);
    else
      connection = this.httpService.put(APIURLS.BR_MASTER_FORM_INSERT_API, this.formItem.id, this.formItem);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200) {
            jQuery("#myModal").modal('hide');
            this.getFormMasterList();
          }
          // else 
          //   this.errMsgPop = data;
          
        }).catch((error)=> {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving form data..';
        });
      }


}
