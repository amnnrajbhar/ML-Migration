import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-offer-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css'],
  providers: [Util]
})
export class AdditionalInfoComponent implements OnInit {
  @ViewChild(NgForm) checklistForm: NgForm;
  @Input() offerId: number;
  @Input() employeeCategoryId: number;
  @Input() totalExperience: number;
  @Input() editAllowed: boolean = true;
  @Input() isMandatoryToFill: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  currentUser: AuthData;
  urlPath: string = '';
  isLoading = false;
  previousExpList: any[] = [];
  jdList: any[] = [];
  interviewerList: any[] = [];  
  finalRemarks: any = {};
  isEdit = false;
  offerDetails:any = {};
  errMsg: string = "";
  interviewRemarksList: any[] = [{criteria:"Education relavant to proposed job", rating: ""},
  {criteria:"Job knowledge", rating: ""},
  {criteria:"Adoptability", rating: ""},
  {criteria:"Attitude/Behavior", rating: ""},
  {criteria:"Confidence", rating: ""},
  {criteria:"Communication skills", rating: ""}];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.GetData();
    }
  }

  
  GetData() {   

    if(this.offerId && this.offerId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.OFFER_GET_ADDITIONAL_INFO+"/"+ this.offerId).then((data: any) => {
        if (data) {
          if(data.previousExpList && data.previousExpList.length > 0)
            this.previousExpList = data.previousExpList;      

          if(data.jdList && data.jdList.length > 0)
            this.jdList = data.jdList;   

          if(data.interviewerList && data.interviewerList.length > 0)
            this.interviewerList = data.interviewerList;   

          if(data.interviewRemarksList && data.interviewRemarksList.length > 0)
            this.interviewRemarksList = data.interviewRemarksList;     

          if(data.finalRemarks && data.finalRemarks != undefined) 
            this.finalRemarks = data.finalRemarks;      
          
          if(this.finalRemarks && this.finalRemarks.remarksDate && new Date(this.finalRemarks.remarksDate).getFullYear() < 2000)
            this.finalRemarks.remarksDate = new Date();
        }
        
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  SaveData(){
    let connection: any;
    var i=0;          
    for(var item of this.interviewerList){
      this.interviewerList[i].name = $("#txtInterviewer_"+i).val();
      this.interviewerList[i].designation = $("#txInterviewerDesignation_"+i).val();
      this.interviewerList[i].employeeNo = $("#hdnInterviewerEmpNo_"+i).val();
      this.interviewerList[i].employeeId = $("#hdnInterviewerEmpId_"+i).val();
      i++;
    }
    this.finalRemarks.name = $("#txtFinalName").val();
    this.finalRemarks.designation = $("#txtFinalDesignation").val();
    this.finalRemarks.employeeNo = $("#hdnFinalEmpNo").val();
    this.finalRemarks.employeeId = $("#hdnFinalEmpId").val();

    for(var item of this.previousExpList){
      if(item.company == null || item.company == undefined || item.company == ""){
        toastr.error("Please enter Company name of previous experience."); return;
      }
      if(item.fromDate == "" || item.fromDate == null || item.fromDate == undefined){
        toastr.error("Please enter From Date of previous experience."); return;
      }
      if(item.toDate != null && item.toDate != "" && item.fromDate >= item.toDate){
        toastr.error("From Date cannot be after To Date."); return;
      }
      if(item.fromDate > new Date()){
        toastr.error("From Date cannot be future Date."); return;
      }
      if(item.toDate != "" && item.toDate != undefined && item.toDate > new Date()){
        toastr.error("To Date cannot be future Date."); return;
      }
      if(item.position == null || item.position == undefined || item.position == ""){
        toastr.error("Please enter Position held in previous experience."); return;
      }
    }
    for(var item of this.interviewerList){
      if(item.name == null  || item.name == undefined || item.name == "" || item.designation == ""){
        toastr.error("Please enter Interviwer details, it cannot be blank."); return;
      }
      if(item.date != "" && item.date != null && item.date != undefined && item.date > new Date()){
        toastr.error("Interview date cannot be future date."); return;
      }
    }
    for(var item of this.jdList){
      if(item.description == "" || item.description == null){
        toastr.error("Please enter Job Description, it cannot be blank."); return;
      }
    }
    if(this.finalRemarks.remarksDate != "" && this.finalRemarks.remarksDate != null && this.finalRemarks.remarksDate != undefined 
    && this.finalRemarks.remarksDate > new Date()){
      toastr.error("Final remarks date cannot be future date."); return;
    }
    // for non-Field Staff candidates this section is mandatory
    if(this.employeeCategoryId != 2 && this.isMandatoryToFill == true){
      if(this.totalExperience > 0 && (this.previousExpList == null || this.previousExpList.length <= 0)){
        toastr.error("Please add atleast one previous experience details."); return;
      }      

      if(this.interviewerList == null || this.interviewerList.length <= 0){
        toastr.error("Please add atleast one Interviewer details."); return;
      }
      
      if(this.jdList == null || this.jdList.length <= 0){
        toastr.error("Please add atleast three Job Description details."); return;
      }
      else if(this.jdList.length < 3){
        toastr.error("Minimum three Job Description details required."); return;
      }
      
      if(this.interviewRemarksList.filter(x=>x.rating == "" || x.rating == null).length > 0){
        toastr.error("Please provide rating for all criteria's mentioned."); return;
      }
      if($("#txtFinalName").val() == "" || $("#txtFinalDesignation").val() == ""){
        toastr.error("Please enter final remarks employee details."); return;
      }
      if(this.finalRemarks.remarksDate == ""){
        toastr.error("Please enter final remarks date."); return;
      }
    }    

    //this.isLoading = true;
    let data: any = {};
    data.offerId = this.offerId;
    data.previousExpList = this.previousExpList;
    data.jdList = this.jdList;
    data.interviewerList = this.interviewerList;
    data.interviewRemarksList = this.interviewRemarksList;
    data.finalRemarks = this.finalRemarks;    
    data.updatedById = this.currentUser.uid;    
    connection = this.httpService.HRpost(APIURLS.OFFER_UPDATE_ADDITIONAL_INFO, data);
    
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        //this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        //this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + error);
      });
  }

  AddExperience(){    
    this.previousExpList.push({});
  }

  RemoveExperience(no){
    this.previousExpList.splice(no,1);
  }

  AddJd(){    
    this.jdList.push({});
  }

  RemoveJd(no){
    this.jdList.splice(no,1);
  }

  AddInterviewer(){    
    this.interviewerList.push({});
  }

  RemoveInterviewer(no){
    this.interviewerList.splice(no,1);
  }

  
  lastkeydown = 0;
  getInterviewerName($event, i) {
    //let text = $('#approvingManager').val();
    let text = this.interviewerList[i].name;

    if (text.length > 3) {
      if ($event.timeStamp - this.lastkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.employeeName + " ("+item.employeeId+")", value: item };
            })
            $('#txtInterviewer_'+i).autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#txtInterviewer_"+i).val(ui.item.label);
                  $("#txInterviewerDesignation_"+i).val(ui.item.value.designation);
                  $("#hdnInterviewerEmpNo_"+i).val(ui.item.value.employeeId);
                  $("#hdnInterviewerEmpId_"+i).val(ui.item.value.id);
                  //this.interviewerList[i].employeeName = ui.item.label;
                  //this.interviewerList[i].employeeId = ui.item.value;
                }
                else{
                  $("#txtInterviewer_"+i).val('');
                  $("#txInterviewerDesignation_"+i).val('');
                  $("#hdnInterviewerEmpNo_"+i).val('');
                  $("#hdnInterviewerEmpId_"+i).val('');
                  //this.interviewerList[i].employeeName = '';
                  //this.interviewerList[i].employeeId = '';
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#txtInterviewer_"+i).val(ui.item.label);
                  $("#txInterviewerDesignation_"+i).val(ui.item.value.designation);
                  $("#hdnInterviewerEmpNo_"+i).val(ui.item.value.employeeId);
                  $("#hdnInterviewerEmpId_"+i).val(ui.item.value.id);
                  //this.interviewerList[i].employeeName = ui.item.label;
                  //this.interviewerList[i].employeeId = ui.item.value;
                }
                else{
                  $("#txtInterviewer_"+i).val('');
                  $("#txInterviewerDesignation_"+i).val('');
                  $("#hdnInterviewerEmpNo_"+i).val('');
                  $("#hdnInterviewerEmpId_"+i).val('');
                  //this.interviewerList[i].employeeName = '';
                  //this.interviewerList[i].employeeId = '';
                }
                return false;
              }
            });
          }
        });
      }
      this.lastkeydown = $event.timeStamp;
    }
  }

  getFinalName($event) {
    let text = $('#txtFinalName').val();    

    if (text.length > 3) {
      if ($event.timeStamp - this.lastkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.employeeName + " ("+item.employeeId+")", value: item };
            })
            $('#txtFinalName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#txtFinalName").val(ui.item.label);
                  $("#txtFinalDesignation").val(ui.item.value.designation);
                  $("#hdnFinalEmpNo").val(ui.item.value.employeeId);
                  $("#hdnFinalEmpId").val(ui.item.value.id);
                }
                else{
                  $("#txtFinalName").val('');
                  $("#txtFinalDesignation").val('');
                  $("#hdnFinalEmpNo").val('');
                  $("#hdnFinalEmpId").val('');
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#txtFinalName").val(ui.item.label);
                  $("#txtFinalDesignation").val(ui.item.value.designation);
                  $("#hdnFinalEmpNo").val(ui.item.value.employeeId);
                  $("#hdnFinalEmpId").val(ui.item.value.id);
                }
                else{
                  $("#txtFinalName").val('');
                  $("#txtFinalDesignation").val('');
                  $("#hdnFinalEmpNo").val('');
                  $("#hdnFinalEmpId").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastkeydown = $event.timeStamp;
    }
  }

  
}
