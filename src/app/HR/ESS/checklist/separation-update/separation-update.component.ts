import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Resignation } from '../../../separation/resignation/resignation.model';
import { AuthData } from '../../../../auth/auth.model';
import { APIURLS } from '../../../../shared/api-url';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import swal from 'sweetalert';
import { AppComponent } from '../../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { ResignationUpdateRequest } from '../../../separation/resignation-list/resignationupdaterequest.model';

declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-separation-update',
  templateUrl: './separation-update.component.html',
  styleUrls: ['./separation-update.component.css']
})
export class SeparationUpdateComponent implements OnInit {
  currentUser: AuthData;
  resignationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isChecked: boolean = true;
  resignationStatus :any;
  resignationDetails= {} as Resignation;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :string ;
  ResignationDate :string;
  objectType: string = "Resignation";
  comments: string;
  action: string;
  noticePeriod: string;
  checklistItems: any[] = [];
  checklistItemId: number = 0;
  statusList = [
    { type: "Pending", color:"warning" },
    { type: "Completed", color:"success"},
    { type: "Not Applicable", color:"info" },    
    { type: "Cancelled", color:"danger" }    
  ]


  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.resignationId = this.route.snapshot.paramMap.get('id')!;  
      this.GetResignationDetailsById(this.resignationId);    
      this.getChecklistData();
    }
  }

  GetResignationDetailsById(id) {
    this.isLoading = true;
    this.isVisible=true;
   
    this.httpService.HRget(APIURLS.RESIGNATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.resignationDetails=data;
         this.resignationId = data.resignationId;
         this.employeeId = data.employeeId;
         this.resignationStatus= this.resignationDetails.status;
         this.DateLastWorkingDay = this.getDateFormate(this.resignationDetails.lastWorkingDate);
         this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
         this.noticePeriod = this.resignationDetails.noticePeriod+' Month(s)';
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg= error;
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getChecklistData(){
    this.isLoading = true;    
      this.httpService.HRget(APIURLS.RESIGNATION_GET_SPOC_CHECKLIST_ITEMS+"/"+ this.resignationId+"/"+this.currentUser.uid).then((data: any) => {
      if (data) {
        this.checklistItems = data;
        for(var item of this.checklistItems){
          item.statusColor = this.statusList.find(x=>x.type == item.status).color;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.resignationDetails = {} as Resignation;
    });
  }

  complete(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Completed";
  }
  
  notApplicable(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Not Applicable";
  }

  UpdateChecklist() {

    if(this.action == "Not Applicable" && this.comments == ""){
      toastr.error("Please enter comments.");
      return;
    }
 

    $("#CommentsModal").modal('hide');
    
      var request:any = {};
      request.checklistItemId = this.checklistItemId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.CHECKLIST_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {          
          this.getChecklistData();
          toastr.success("Successfully updated.");
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred.");
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error(error);
      });
  }
  
  cancel() {
    this.location.back();
  }

}
