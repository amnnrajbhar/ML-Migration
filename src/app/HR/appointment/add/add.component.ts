import { Component, Input, OnInit, ViewChild  } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OfficialComponent } from '../official/official.component';
import { StatutoryComponent } from '../statutory/statutory.component';
import { SalaryComponent } from '../salary/salary.component';
import { AssetsComponent } from '../assets/assets.component';
import { PersonalComponent } from '../personal/personal.component';
import { AddressesComponent } from '../addresses/addresses.component';
import { EducationComponent } from '../education/education.component';
import { FamilyComponent } from '../family/family.component';
import { LanguagesComponent } from '../languages/languages.component';
import { BankDetailsComponent } from '../bank-details/bank-details.component';
import { WorkexperienceComponent } from '../workexperience/workexperience.component';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { NominationComponent } from '../nomination/nomination.component';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [Util]
})

export class AddComponent implements OnInit {
@ViewChild(OfficialComponent, { static: false }) officialDetails: OfficialComponent;
@ViewChild(StatutoryComponent, { static: false }) statutoryDetails: StatutoryComponent;
@ViewChild(SalaryComponent, { static: false }) salaryDetails: SalaryComponent;
@ViewChild(AssetsComponent, { static: false }) assetsDetails: AssetsComponent;
@ViewChild(PersonalComponent, { static: false }) personalDetails: PersonalComponent;
@ViewChild(AddressesComponent, { static: false }) addressDetails: AddressesComponent;
@ViewChild(EducationComponent, { static: false }) educationDetails: EducationComponent;
@ViewChild(FamilyComponent, { static: false }) familyDetails: FamilyComponent;
@ViewChild(LanguagesComponent, { static: false }) languageDetails: LanguagesComponent;
@ViewChild(WorkexperienceComponent, { static: false }) workDetails: WorkexperienceComponent;
@ViewChild(BankDetailsComponent, { static: false }) bankDetails: BankDetailsComponent;
@ViewChild(AttachmentsComponent, { static: false }) attachmentDetails: AttachmentsComponent;
@ViewChild(NominationComponent, { static: false }) nominationComponent: NominationComponent;


  appointmentId: any;
  appointmentDetails: any = {};
  isLoading: boolean = false;
  showData: boolean = false;
  confirmSubmit: boolean = false;
  completedTabIndex: number = 0;
  currentTab:string = "initial";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  successMsg: string = "";
  disableAction: boolean = false;
  tabIndex: number = 0;
  tabsList: string[] = ["initial", "statutory", "salary", "assets", "addresses","family","education","work_experience","languages","nomination","bank", "attachments"];

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.showData = true;
    }
  }
    
  
  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

onNext(){
  if(this.currentTab == "initial"){
    var valid1 = this.officialDetails.validate()
    var valid2 = this.personalDetails.Validate(this.officialDetails.details);
    if(valid1 && valid2)
      this.personalDetails.saveData(this.officialDetails.details);   
  }
  else if(this.currentTab == "statutory"){
    this.statutoryDetails.saveData();   
  }
  else if(this.currentTab == "salary"){
    this.salaryDetails.saveData();   
  }
  else if(this.currentTab == "assets"){
    this.assetsDetails.saveData();   
  }
  else if(this.currentTab == "addresses"){
    this.addressDetails.saveData();
  }
  else if(this.currentTab == "family"){
    this.familyDetails.saveData();
  }
  else if(this.currentTab == "education"){
    this.educationDetails.saveData();
  }
  else if(this.currentTab == "work_experience"){
    this.workDetails.saveData();
  }
  else if(this.currentTab == "languages"){
    this.languageDetails.saveData();
  }
  else if(this.currentTab == "nomination"){
    this.nominationComponent.saveData();
  }
  else if(this.currentTab == "bank"){
    this.bankDetails.saveData();
  }
  else if(this.currentTab == "attachments"){
    //this.attachmentDetails.saveData();
  }  
}

appointmentCreated=false;
onDataSaved(result){
  if(result == 200 || result.success || result.id > 0){
    if(this.currentTab == "initial" && this.appointmentCreated == false){
      this.appointmentCreated=true;
      this.appointmentId = result.id;
      this.officialDetails.appointmentId = result.id;
      this.officialDetails.saveData();
    }
    else
      this.showNext();
  }
  else
    swal(result.message);
}

onDataLoaded(status){
  if(status != undefined && status != null && status != "Entry In Progress" && status != "loaded"){    
    return;
  }
  $("#tab_"+this.currentTab).addClass("completed");
}

showNext(){
  $("#tab_"+this.currentTab).addClass("completed");
  this.tabIndex++;
  this.completedTabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}


onSubmit(){
  if (!this.attachmentDetails.validateAttachments())
    return;

  let connection: any;
  let data: any = {};
  
  data.appointmentId = this.appointmentId;
  // if(!this.confirmSubmit){
  //   swal("Please check the declaration check box to submit the details.");
  //   return;
  // }
  if(!confirm("Are you sure you want to submit?"))
    return;
    
  this.isLoading = true;
  swal('Submitting...');

  connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_DETAILS, data);
  connection.then(
    (data: any) => {
      this.isLoading = false;
      if (data == 200 || data.success) {
        //this.successMsg = 'Submitted successfully.';  
        toastr.success("Submitted successfully.");  
        this.router.navigate(['/HR/appointment/list']);
      }
      else{
        swal(data.message);
      }        
    },
    (err) => {
      this.isLoading = false;
      swal('Error occured while submitting the details. Error:' + err);
    })
    .catch(error => {
      this.isLoading = false;
      swal('Error occured while submitting the details. Error:' + error);
    });
}

onTabClick(index){
  if(this.disableAction || index <= this.tabIndex ){
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }
}


}
