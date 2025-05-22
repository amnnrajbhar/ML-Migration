import { Component, Input, OnInit, Output, EventEmitter, ViewChild,OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AuthData } from '../../../../auth/auth.model';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser'
import { SharedVar } from '../sharedvar';
import swal from 'sweetalert';
import { TemporaryProfile } from '../temporaryprofile.model';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css'],
  providers: [Util, AppointmentService],
})
export class AssetsComponent implements OnInit {
@ViewChild(NgForm, { static: false }) assetForm: NgForm;

  @Input() employeeId: number;
  @Input() profileDetails: TemporaryProfile;
  @Input() editAllowed: boolean ;
  @Input() profileId: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  

  isLoading = false;
  assetList: any[] = [];
  item: any = {};
  assetTypes: any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedAssetType: any = null;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  assetLists: any[] = [];
  profileDetailsList: any={};
  profileUpdate = false;
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"danger"},
    { type: "Add", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private util: Util,
    private route: ActivatedRoute,private service: AppointmentService) { }

    ngOnInit() {
      this.urlPath = this.router.url;
      this.getAssetTypes();
  
        var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
        if (chkaccess == true) {
          this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.LoadData();
        }
        if (this.currentUser.hrEmployeeId == this.employeeId)
        {
          this.editAllowed = false;
        }
        if (this.profileId>0)
        {
          this.profileUpdate = true;
          this.getProfileData(this.profileId);
        }
    }  

    
  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_ASSETS + "/" + this.employeeId).then((data: any) => {
      if (data && data.length > 0) {
        this.assetList = data;
        this.count = data.length;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.assetList = [];
    });
  }

  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        this.profileDetailsList.assetDetails = this.profileDetailsList.assetDetails.filter(x => x.action!="None");
        for(var item of this.profileDetailsList.addressDetails){
          item.statusColor = this.statusList.find(x=>x.type == item.action).color;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
    

    getValues() : TemporaryProfile 
    {
      this.profileDetails.employeeId = this.employeeId;
      this.profileDetails.assetDetails = this.assetList;
      return (this.profileDetails);
    }
    
  getAssetTypes(): any {      
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ASSET_TYPES).then((data: any) => {
      if (data.length > 0) {
        this.assetTypes = data;
      }
    }).catch(error => {
      this.assetTypes=[];
    });
  }

  onAddLine(files){    
    if (files.length === 0){
      swal("Please select an attachment file.");
      return;
    }  
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      this.item.attachmentFileName = file.name;
    }
    this.item.assetType = this.selectedAssetType.assetType;
    this.item.assetTypeId = this.selectedAssetType.id;
    this.item.action = "Add";
    this.assetList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedAssetType = this.assetTypes.find(x=>x.id==item.assetTypeId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }
  onUpdateLine(){
    this.item.assetType = this.selectedAssetType.assetType;
    this.item.assetTypeId = this.selectedAssetType.id;    
    this.item.action = "Update";
    this.assetList[this.editIndex] = this.item;    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.assetList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.selectedAssetType = null;   
    this.assetForm.form.markAsPristine();
    this.assetForm.form.markAsUntouched();
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
