import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
//import { Http } from '@angular/http';
import { throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { EssTemplates } from './EssTemplates.model';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

declare var ActiveXObject: (type: string) => void;

@Component({
  selector: 'app-EssTemplates',
  templateUrl: './EssTemplates.component.html',
  styleUrls: ['./EssTemplates.component.css']
})

export class EssTemplatesComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;

  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;
  public tableWidget: any;
  public tableWidgetlv: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string;
  employeeId: any = null;
  userMasterItem: any = {};
  submitting: boolean;
  isSubmitting: boolean;
  snackBar: any;
  isShowFileUpload: boolean;
  UserId: string;
  DescriptionList: any;
  attachments: any[];
  filtertype: string;
  id:number;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
    
  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.employeeId = this.currentUser.employeeId;
    this.getDescription();
     var chkaccess = this.appService.validateUrlBasedAccess(this.path);
  }


getDescription() {
    this.errMsg = "";
    this.isLoading = true;
    this.DescriptionList=[];
    this.httpService.get(APIURLS.BR_ESSTEMPLATES_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.DescriptionList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.DescriptionList = [];
    });
  }

  getFile(id, description) {
    if (id <= 0) return;
    var name=id+','+description;
    this.httpService.getFile(APIURLS.BR_GET_ESS_ATTACHMENTS,id,description).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }
  
      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], description);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  // downloadFile(description, id) {
  //   // console.log(filename);
  //   if (description.length > 0) {
  //     this.httpService.getFile1(APIURLS.BR_GET_ESS_ATTACHMENTS, id,description).then((data: any) => {
  //       // console.log(data);
  //       //  let temp_name = this.visitorsList1.find(s => s.id == id).name;
  //       if (data != undefined) {
  //         var FileSaver = require('file-saver');
  //         const imageFile = new File([data], name, { type: 'application/doc' });
  //         // console.log(imageFile);
  //         FileSaver.saveAs(imageFile);
  //       }
  //     }).catch(error => {
  //       this.isLoading = false;
  //     });
  //   } else {
  //     swal({
  //       title: "Message",
  //       text: "No File on server",
  //       icon: "warning",
  //       dangerMode: false,
  //       buttons: [false, true]
  //     }).then((willDelete) => {
  //       if (willDelete) {
  //         this.isLoading = false;
  //       }
  //     });
  //   }
  //}
}
  

  


 



