import { Component, Input, OnInit, Output, EventEmitter, ViewChild,OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { AuthData } from '../../../../auth/auth.model';
import { DomSanitizer } from '@angular/platform-browser';
import { TemporaryProfile } from '../temporaryprofile.model';
import { SharedVar } from '../sharedvar';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.css'],
  providers:[Util,AppointmentService]
})
export class FamilyComponent implements OnInit {
  @ViewChild(NgForm , { static: false })  familyForm: NgForm;
  @Input() employeeId: number;
  @Input() profileDetails: TemporaryProfile;
  @Input() editAllowed: boolean ;
  @Input() profileId: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  isLoading = false;
  stateList: any[] = [];
  countryList: any[] = [];
  courseList:any[] = [];
  relationshipTypes:any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedCourse: any = null;
  selectedRelationType: any =null;
  selectedState: any = null;
  selectedCountry: any = null;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  familyList:any={};
  familyLists:any={};
  item:any={};
  selectedRelationshipType: any = null;
  personalDetails: any = {};
  profileDetailsList: any={};
  profileUpdate = false;
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }, { type: "Late." }];
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"danger"},
    { type: "Add", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, 
    private service: AppointmentService,private route: ActivatedRoute) { }

  ngOnInit() {    
    this.service.getRelationTypes().then((data:any)=>{this.relationshipTypes = data;});
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
      this.profileDetails.familyDetails = this.familyLists;
      return this.profileDetails;
    }

getData(id) {
  this.isLoading = true;

  this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_FAMILY, id).then((data: any) => {
    if (data) {
      this.familyList = data;
      this.familyLists = this.familyList;
    }
    this.isLoading = false;
  }).catch(error => {
    this.isLoading = false;
  });
}

getProfileData(id)
{
  this.isLoading = true;

  this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
    if (data) {
      this.profileDetailsList = data;
      this.profileDetailsList.familyDetails = this.profileDetailsList.familyDetails.filter(x => x.action!="None");
      for(var item of this.profileDetailsList.familyDetails){
        item.statusColor = this.statusList.find(x=>x.type == item.action).color;
      }
    }
    this.isLoading = false;
  }).catch(error => {
    this.isLoading = false;
  });
}
  onRelationshipChange(){
    if(this.selectedRelationshipType){
      this.familyList.gender = this.selectedRelationshipType.gender; 
      this.item.gender = this.selectedRelationshipType.gender;
      if(this.selectedRelationshipType.relationship.toLowerCase() == "spouse")
      {
        this.familyList.gender = this.personalDetails.gender.toLowerCase() =="male"?"Female":"Male" ; 
      }
    }
  }
  onAddLineClick(){    
    console.log(this.selectedRelationshipType);
    this.item.relationshipType = this.selectedRelationshipType.relationship;
    this.item.relationshipTypeId = this.selectedRelationshipType.id;    
    var today = new Date();
    if(this.item.birthDate != "" && this.item.birthDate >= today  ){
      toastr.error("Birth date should be before today date.");
        return;
    }
    this.item.action = "Add";
    //this.familyLists.push(this.item);
    this.familyList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedRelationshipType = this.relationshipTypes.find(x=>x.id==item.relationshipTypeId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateClick(){
    this.item.relationshipType = this.selectedRelationshipType.relationship;
    this.item.relationshipTypeId = this.selectedRelationshipType.id;    
    var today = new Date();
    if(this.item.birthDate != "" && this.item.birthDate >= today  ){
      toastr.error("Birth date should be before today date.");
        return;
    }
    this.item.action = "Update";
    this.familyList[this.editIndex] = this.item;
    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.familyLists[no].action = "Delete";
    this.familyList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {isEmployee:"No"};
    this.editIndex = -1;    
    this.selectedRelationshipType = null;
    this.familyForm.form.markAsPristine();
    this.familyForm.form.markAsUntouched();
  }
}
