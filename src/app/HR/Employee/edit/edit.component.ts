import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
import { AddressComponent } from '../../ESS/profile/address/address.component';
import { ExperienceComponent } from '../../ESS/profile/experience/experience.component';
import { LanguagesComponent } from '../../ESS/profile/languages/languages.component';
import { OfficialComponent } from '../../ESS/profile/official/official.component';
import { EducationComponent } from '../../ESS/profile/education/education.component';
import { FamilyComponent } from '../../ESS/profile/family/family.component';
import { AssetsComponent } from '../../ESS/profile/assets/assets.component';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-employee-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
@ViewChild(AddressComponent, { static: false }) addressDetails: AddressComponent;
@ViewChild(EducationComponent, { static: false }) educationDetails: EducationComponent;
@ViewChild(ExperienceComponent, { static: false }) experienceDetails: ExperienceComponent;
@ViewChild(FamilyComponent, { static: false }) familyDetails: FamilyComponent;
@ViewChild(LanguagesComponent, { static: false }) languagesDetails: LanguagesComponent;
@ViewChild(AssetsComponent, { static: false }) assetDetails: AssetsComponent;

  @ViewChild(OfficialComponent, { static: false }) officialDetails: OfficialComponent;
  employeeId: any;
  details: any = {};
  objectType: string = "Employee";
  objectTypeProfile: string = "Employee Profile";
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;

  currentTab: string = "official";
  tabIndex: number = 0;
  tabsList: string[] = ["official", "assets", "address", "education", "experience", "family", "languages", "history"];
  profileDetails: any = {};
  id: any;
  profileUpdateStatus: any;
  isPending: boolean = false; 
  editAllowed = true;
  profileId: any;
  attachementDeleteAllowed = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }


  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.id = this.route.snapshot.paramMap.get('id')!;
      if (this.id > 0) {
        this.employeeId = this.id;
        this.attachementDeleteAllowed = true;
      }
      else {
        this.employeeId = this.currentUser.hrEmployeeId;
      }
      this.LoadEmployeeDetails(this.employeeId);
      this.getProfileData(this.employeeId);
    }
  }

  
  LoadEmployeeDetails(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.details = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  getProfileData(id:any) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_BY_EMPLOYEE_ID + "/" + id).then((data: any) => {
      if (data) {
        if(data.status == "Pending For Approval"){
          toastr.error("Profile update is Pending for Approval, cannot edit again.");
          this.location.back();
        }        
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  onBack() {
    this.location.back();
  }

  onPrevious() {
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

  onNext() {
    this.update();
    if (this.isValid == true) {
      this.tabIndex++;
      this.currentTab = this.tabsList[this.tabIndex];
    }
  }

  onDataLoaded(data: any) {
    // console.log(data);
  }


  onTabClick(index) {
    this.update();
    if (this.isValid == true) {
      this.tabIndex = index;
      this.currentTab = this.tabsList[this.tabIndex];
    }
    this.isLoading = false;
  }

  isValid: boolean = true;
  update() {
    this.isValid = true;
    if (this.currentTab == "address") {
      this.profileDetails = this.addressDetails.getValues();
      if (this.profileDetails.addressDetails.length == 0) {
        toastr.error("Address Details cannot be Empty");
        this.isValid = false;
        return;
      }
    }
    if (this.currentTab == "education") {
      this.profileDetails = this.educationDetails.getValues();
      //console.log(this.profileDetails.educationDetails);  
      if (this.profileDetails.educationDetails.length == 0) {
        toastr.error("Education Details cannot be Empty");
        this.isValid = false;
        return;
      }
    }
    if (this.currentTab == "experience") {
      this.profileDetails = this.experienceDetails.getValues();
      if (this.profileDetails.experienceDetails.length == 0) {
        toastr.error("Experience Details cannot be Empty");
        this.isValid = false;
        return;
      }
    }
    if (this.currentTab == "family") {
      this.profileDetails = this.familyDetails.getValues();
      if (this.profileDetails.familyDetails.length == 0) {
        toastr.error("Family Details cannot be Empty");
        this.isValid = false;
        return;
      }
    }
    if (this.currentTab == "languages") {
      this.profileDetails = this.languagesDetails.getValues();
      // if (this.profileDetails.languageDetails.length == 0) {
      //   toastr.error("Languages Details Can not be Empty");
      //   this.isValid = false;
      //   return;
      // }
    }
    if (this.currentTab == "official") {
      this.profileDetails = this.officialDetails.getValues();
    }
    if (this.currentTab == "assets") {
      this.profileDetails = this.assetDetails.getValues();
    }
  }


  files: any[] = [];
  selectFiles(event) {
    this.files = event.target.files;
  }


  addAttachments(submit) {

    if (this.files.length > 0) {

      const formData = new FormData();
      var index = 0;
      for (const file of this.files) {
        var ext = file.name.split('.').pop();
        if (ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png") {
          toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
          return;
        }
        if (file.size > (2 * 1024 * 1024)) {
          toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
          return;
        }
        formData.append("attachments[" + index + "]", file);
        index++;
      }
      toastr.info("Uploading attachment files ...");
      this.isLoading = true;
      this.httpService.HRpostAttachmentFile(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_ADD_ATTACHMENTS + "/" + this.temporaryProfileId, formData)
        .then(
          (data: any) => {
            this.isLoading = false;
            if (data == 200 || data.success) {
              toastr.success('Files uploaded successfully!');
              this.location.back();
            }
            else
              toastr.error(data.message);
          })
        .catch((error)=> {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }
  }

  temporaryProfileId: any;
  submit() {
    let connection: any;
    let data: any;
    this.update();
    if (this.currentTab == "languages") {
      this.profileDetails = this.languagesDetails.getValues();
    }
    if (this.profileDetails.reasonForUpload == undefined || this.profileDetails.reasonForUpload == '') {
      toastr.error("Enter Reason for update");
      return;
    }
    if (this.files.length === 0) {
      toastr.error("Please select an attachment file.");
      return;
    }
    if (confirm("Are you sure you want to submit the updates?")) {
      this.isLoading = true;
      this.profileDetails.employeeId = this.employeeId;
      this.profileDetails.createdById = this.currentUser.uid;
      connection = this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_SAVE, this.profileDetails);
      connection.then(
        (data: any) => {
          this.isLoading = false;
          if (data == 200 || data.success) {
            toastr.success('Details Sumittted For Approval successfully');
            this.temporaryProfileId = data.profileId;
            this.addAttachments(this.temporaryProfileId);
            this.location.back();
          }
          else
            toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while saving resignation details. Error:' + err);
        })
        .catch((error)=> {
          this.isLoading = false;
          toastr.error('Error occured while saving resignation details. Error:' + error);
        });
    }

  }

}
