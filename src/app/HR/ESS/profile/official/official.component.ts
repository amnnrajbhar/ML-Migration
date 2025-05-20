import { Component, Input, OnInit ,Output,EventEmitter,ViewChild,OnDestroy } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { AuthData } from '../../../../auth/auth.model';
import { APIURLS } from '../../../../shared/api-url';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
import { TemporaryProfile } from '../temporaryprofile.model';
import { SharedVar} from '../sharedvar';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-profile-official',
  templateUrl: './official.component.html',
  styleUrls: ['./official.component.css'],
  providers: [Util,AppointmentService],
})
export class OfficialComponent implements OnInit {
  @ViewChild(NgForm) educationForm: NgForm;
  @Input() employeeId: number;
  @Input() editAllowed: boolean ;
  @Input() profileId: number = 0;
  @Input() profileDetails: TemporaryProfile;  
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  details:any = {};
  officialList: any[] = [];
  profileDetailsList: any={};
  profileUpdate = false;
  statusList = [
    { type: "Update", color:"info" },    
    { type: "Delete", color:"warning"},
    { type: "Add", color:"success" },   
  ]
  isESS :boolean = false;
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

    ngOnInit() {
      this.urlPath = this.router.url;
      var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
      
      if (chkaccess == true) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.LoadEmployeeDetails(this.employeeId);
      }
      if (this.currentUser.hrEmployeeId == this.employeeId && this.editAllowed)
      {
        this.isESS = false;
      } 
      else if (this.currentUser.hrEmployeeId == this.employeeId && !this.editAllowed)
      {
        this.isESS = false;
      }
      else if (this.currentUser.hrEmployeeId != this.employeeId && this.editAllowed)
        {
          this.isESS = true;
        }
        else if (this.currentUser.hrEmployeeId != this.employeeId && !this.editAllowed)
          {
            this.isESS = false;
          }
      if (this.profileId>0)
      {
        //this.editAllowed=false;
        this.profileUpdate = true;
        this.getProfileData(this.profileId);        
      }else
      this.getProfileDataByEmpId(this.employeeId);
     
    }
  
  LoadEmployeeDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.details = data;
        //console.log(this.details);
        //this.dataLoaded.emit("Hello");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  getValues() : TemporaryProfile 
  {
    this.profileDetails.employeeId = this.employeeId;
    this.details.action="Update";
    this.officialList.push(this.details);
    console.log(this.officialList);
    this.profileDetails.officialDetails=this.officialList;
    return this.profileDetails;
  }

  getProfileData(id)
  {
    this.isLoading = true;
    
    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetailsList = data;
        //this.details = data.officialDetails;
        this.profileDetailsList.officialDetails = this.profileDetailsList.officialDetails.filter(x => x.action!="None");
        for(var item of this.profileDetailsList.officialDetails){
          item.statusColor = this.statusList.find(x=>x.type == item.action).color;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  getProfileDataByEmpId(id) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_BY_EMPLOYEE_ID + "/" + id).then((data: any) => {
      if (data) {        
        this.editAllowed = this.editAllowed && (data.status == "Approved" ) ? true : false;
        if(this.editAllowed == false){
          //this.profileUpdate = true;
          //this.profileId = data.profileId;
          this.profileDetailsList = data;
          this.profileDetailsList.officialDetails = this.profileDetailsList.officialDetails.filter(x => x.action != "None");
        
          for (var item of this.profileDetailsList.officialDetails) {
            item.statusColor = this.statusList.find(x => x.type == item.action).color;
          }
        }        
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  update()
  {
   let connection: any;
   let data:any;
   
    
   if(confirm("Are you sure you want to submit update?"))
   {
     this.isLoading = true;
 
     this.profileDetails.employeeId = this.employeeId;
     this.profileDetails.officialDetails = this.details;
     connection = this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_SAVE, this.profileDetails);
     connection.then(
     (data: any) => {
       this.isLoading = false;       
       if (data == 200 || data.success) 
       {   
         toastr.success('Details saved successfully');
         SharedVar.profileId=data.profileId;
         this.dataLoaded.emit(data.profileId);
       }
       else
       toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
     },
     (err) => {
       this.isLoading = false;
       toastr.error('Error occured while saving  etails. Error:' + err);
     })
     .catch(error => {
       this.isLoading = false;
       toastr.error('Error occured while saving details. Error:' + error);
     });
  }
 
 }
}
