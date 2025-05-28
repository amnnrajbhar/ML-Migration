import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Resignation } from '../resignation/resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import swal from 'sweetalert';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { ResignationUpdateRequest } from '../resignation-list/resignationupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-view-resignation',
  templateUrl: './view-resignation.component.html',
  styleUrls: ['./view-resignation.component.css']
})
export class ViewResignationComponent implements OnInit {
  currentUser!: AuthData;
  resignationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isRejected: boolean = false;
  resignationStatus :any;
  
  resignationDetails= {} as Resignation;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :string ;
  ResignationDate :string;
  currentTab:string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments","checklist","exitinterview", "history"];
  objectType: string = "Resignation";
  fileList: any[] = [];
  noticePeriod: string

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

  hrUser:string;  
  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.resignationId = this.route.snapshot.paramMap.get('id')!; 
      this.hrUser = this.route.snapshot.paramMap.get('id2')!; 
      if (this.hrUser==undefined)
      {
        this.hrUser='1';
      }       
      this.GetResignationDetailsById(this.resignationId);    
      
    }
  }

  GetResignationDetailsById(id:any) {
    this.isLoading = true;
   
    this.httpService.HRget(APIURLS.RESIGNATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.resignationDetails=data;
         this.fileList = data.attachments;
         this.employeeId = data.employeeId;
         this.resignationStatus= this.resignationDetails.status;
         this.DateLastWorkingDay = this.getDateFormate(this.resignationDetails.lastWorkingDate);
         this.ResignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
         this.noticePeriod = this.resignationDetails.noticePeriod+' Month(s)';
         if(this.resignationStatus == "Rejected" || this.resignationStatus == "Withdrawn")
          this.isRejected= true;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.errMsg= error;
    });
  }


onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

reloadCurrentPage() {
  let currentUrl = this.router.url;
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate([currentUrl]);
  });
}

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  Back(){
    this.location.back();
  }

}
