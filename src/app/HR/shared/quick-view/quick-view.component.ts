import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';

@Component({
  selector: 'app-employee-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.css']
})
export class QuickViewComponent implements OnInit {
  @Input() employeeId: number;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  employeeDetails: any = {};
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Terminated", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {

    this.urlPath = this.router.url;
    var chkaccess = true;
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.GetEmployeeDetails(this.employeeId);
    }
  }

  GetEmployeeDetails(id) {
    if(id > 0){
      this.isLoading = true;
      this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
        if (data) {
          this.employeeDetails = data;
          this.employeeDetails.dateOfJoining = this.getDateFormate(this.employeeDetails.dateOfJoining);
          this.employeeDetails.fullName = this.employeeDetails.firstName + ' ' + this.employeeDetails.middleName + ' ' + this.employeeDetails.lastName;
          this.employeeDetails.statusColor = this.statusList.find(x => x.type == data.status).color;
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;

      });
    }
  }
  
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "/" + ("00" + (d1.getMonth() + 1)).slice(-2) + "/" +
      ("00" + d1.getDate()).slice(-2);
  }

}
