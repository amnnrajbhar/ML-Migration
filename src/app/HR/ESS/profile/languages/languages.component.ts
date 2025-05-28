import { Component, Input, OnInit ,Output,EventEmitter,ViewChild,OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TemporaryProfile } from '../temporaryprofile.model';
import { SharedVar } from '../sharedvar';
import { AuthData } from '../../../../auth/auth.model';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css'],
  providers:[Util,AppointmentService]
})
export class LanguagesComponent implements OnInit {
  @Input() employeeId!: number;
  @Input() profileDetails: TemporaryProfile;
  @Input() editAllowed: boolean ;
  @Input() profileId!: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  languageList: any[] = [];
  languageLists: any[] = [];
  languageTypes: any[] = [];
  count: number = 0;
  isLoading: boolean = false;
  currentUser!: AuthData;
  objectType: string = "Employee Profile";
  profileDetailsList: any={};
  profileUpdate = false;
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"warning"},
    { type: "Add", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService) { }

  ngOnInit() {    

    this.service.getLanguages().then((data:any)=>{this.languageTypes = data;});

    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getData(this.employeeId);
    }

    if (this.profileId>0)
    {
      this.profileUpdate = true;
      this.getProfileData(this.profileId);
    }

  }

  getValues() : TemporaryProfile 
  {
    this.profileDetails.employeeId = this.employeeId;
    for(var item of this.languageList){
      item.action = "Update";
      if(item.languageId > 0){
        item.language = this.languageTypes.find(x=>x.id == item.languageId).language;
      }
    }
    this.profileDetails.languageDetails = this.languageList;
    return this.profileDetails;
  }


  getData(id:any) {
    this.isLoading = true;
  
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_LANGUAGE, id).then((data: any) => {
      if (data) {
        this.languageList = data;
        this.count = data.length;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        //this.profileDetailsList.languageDetails = this.profileDetailsList.languageDetails.filter((x:any)  => x.action!="None");
        // for(var item of this.profileDetailsList.languageDetails){
        //   item.statusColor = this.statusList.find(x=>x.type == item.action).color;
        // }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  submitForApproval(id){        
    var request: any = {};
    request.profileId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        toastr.success("Successfully submitted for approval.");  
        this.router.navigate(['HR/ess/profile/view']);
      }else if(!data.success){
        toastr.error(data.message); 
      }else
      toastr.error("Error occurred while submitting.");
    }).catch((error)=> {
      toastr.error(error);
    });    
}
  onAddLineClick(){    
    //this.languageLists.push({});
    this.languageList.push({});
    this.languageList[this.count].action = "Add";
    this.count++;
  }

  RemoveLine(no){
    this.languageLists[no].action = "Delete";
    this.languageList.splice(no,1);
    this.count--;
  }

}


