import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Location } from '@angular/common';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { OfferDetails } from '../../models/offerdetails.model';
import { switchMap } from 'rxjs/operators';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { OfferSalaryComponent } from '../../offersalary/offersalary.component';
import swal from 'sweetalert';
import { Util } from '../../Services/util.service';
import { AdditionalInfoComponent } from '../additional-info/additional-info.component';
import { ChecklistComponent } from '../checklist/checklist.component';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css'],
  providers: [Util]
})
export class ApproveComponent implements OnInit {
 @ViewChild(ChecklistComponent, { static: false }) checklistDetails: ChecklistComponent;
@ViewChild(OfferSalaryComponent, { static: false }) offerSalaryComponent: OfferSalaryComponent;
@ViewChild(AdditionalInfoComponent, { static: false }) additionalInfoComponent: AdditionalInfoComponent;

  offerId: any;
  objectType: string = "Offer Letter";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  offerDetails = {} as OfferDetails;
  isEdit: boolean = false;
  fileList: any[] = [];
  salaryTypes = [{type:"Annual"}, {type: "Monthly"}];
  packageTypes = [{ type: "Annual CTC" }, { type: "Monthly Gross" }, { type: "Monthly Takehome" }];
  oldSalary: any;
  currentTab:string = "salary";
  tabIndex: number = 0;
  tabsList: string[] = ["salary", "additionalInfo", "breakup", "checklist", "attachments", "approval"];
  taskId: any;
  comments:string;
  secondSignatoryRequired= false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location,
    private util: Util) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.offerId = this.route.snapshot.paramMap.get('id')!;      
      this.taskId = this.route.snapshot.paramMap.get('id2')!;      
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
      this.LoadOfferDetails(this.offerId);
    }
  }

  LoadOfferDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.OFFER_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.offerDetails = data;
        //this.fileList = data.attachments;
        this.oldSalary = data.offeredSalary;
        if(data.secondSignatoryId > 0){
          this.secondSignatoryRequired = true;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.offerDetails = {} as OfferDetails;
    });
  }

  getFile(id, fileName){
    if(id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.OFFER_DETAILS_GET_ATTACHMENT_FILE+ "/" + this.offerId + "/"+ id).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }
  
      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }

  approve(){
    
    if(confirm("Are you sure you want to approve this?"))
    {
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      swal("Approving...");
      this.httpService.HRpost(APIURLS.OFFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }else{
            swal("Task Approved successfully.");
            //this.location.back();
            this.router.navigate(['HR/offer/pending-tasks']);
          }
        }
      }).catch(error => {
        toastr.error("Error occured.");
      });
    }
  }

  reject(){        
    
    if(this.comments == ""){
      toastr.error("Please enter the reason for rejection in comments."); return;
    }

    if(confirm("Are you sure you want to reject this?"))
    {
      var request = {} as CompleteTaskRequest;
      request.flowTaskId = this.taskId;
      request.comments = this.comments;
      request.completedById = this.currentUser.uid;
      swal("Rejecting...");
      this.httpService.HRpost(APIURLS.OFFER_REJECT_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            toastr.error(data.message);
          }
          else{
            toastr.success("Task Rejected successfully.");
            //this.location.back();
            this.router.navigate(['HR/offer/pending-tasks']);
          }
        }
      }).catch(error => {
        toastr.error(error);
      });
    }
  }
  
  updateData(){
    
    // if no change in salary then don't update
    if( this.oldSalary == this.offerDetails.offeredSalary) this.showTab();

    let connection: any;    
    let data: any = {};
    this.isLoading = true;
    data.offerId = this.offerId;
    data.packageType = this.offerDetails.packageType;
    data.salaryType = this.offerDetails.salaryType; 
    data.offeredSalary = this.offerDetails.offeredSalary;    
    data.updatedById = this.currentUser.uid;      
    connection = this.httpService.HRpost(APIURLS.OFFER_DETAILS_UPDATE_SALARY_INFO, data);
    
    connection.then(
      (data: any) => {
      this.isLoading = false;
      if (data == 200 || data.success) 
      {             
        toastr.success("Details saved successfully.");
        this.showTab();
      }
      else
      toastr.error(data.message);
    },
    (err)=>{
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while saving Details. Error:'+ err;
      toastr.error(this.errMsgModalPop);
    })
    .catch(error => {
      this.isLoading = false;
      this.errMsgModalPop = 'Error occured while saving Details. Error:'+ error;
      toastr.error(this.errMsgModalPop);
    });
  }
  
onDataSaved(result){
  if(result == 200 || result.success){    
      this.showTab();    
  }
  else{
    this.tabIndex = this.oldTabIndex;
    swal(result.message);
  }
}
  
SaveData(){    
  if(this.currentTab == "salary"){
    this.updateData();
  }
  else if(this.currentTab == "additionalInfo"){    
    this.additionalInfoComponent.SaveData();
  }
  else if(this.currentTab == "breakup"){
    this.offerSalaryComponent.saveData();
  } 
  else if(this.currentTab == "checklist"){
    this.checklistDetails.SaveData();
  }
  else 
    this.showTab(); 
}

oldTabIndex=0;
onPrevious(){    
  this.oldTabIndex = this.tabIndex;
  this.tabIndex--;
  this.SaveData();     
}

onNext(){     
  this.oldTabIndex = this.tabIndex;
    this.tabIndex++;
    this.SaveData();
  }

onTabClick(index){    
  this.oldTabIndex = this.tabIndex;
  this.tabIndex = index;
  this.SaveData();
  //this.currentTab = this.tabsList[this.tabIndex];
}

showTab(){
  this.currentTab = this.tabsList[this.tabIndex];
}

  cancel() {
    //this.location.back();
    this.router.navigate(['HR/offer/pending-tasks']);
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }

}
