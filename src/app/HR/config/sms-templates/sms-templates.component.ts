import { Component, OnInit } from '@angular/core';
import { AuthData } from '../../../auth/auth.model';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../shared/app.service';
import { Util } from '../../Services/util.service';
import { APIURLS } from '../../../shared/api-url';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-sms-templates',
  templateUrl: './sms-templates.component.html',
  styleUrls: ['./sms-templates.component.css'],
  providers: [Util]
})
export class SmsTemplatesComponent implements OnInit {
  currentUser!: AuthData;
  employeeId: any;
  urlPath: string = '';
  isLoading: boolean = false;
  templatesList: any[] = [];
  details: any = {};
  action = "add";
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private util: Util, 
    private route: ActivatedRoute, private location: Location) {
  }

  ngOnInit() {

    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.currentUser.uid;
      this.GetTemplatesList();
    }
  }
  
  GetTemplatesList() {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.SMS_TEMPLATES_API+"/GetAll").then((data: any) => {
      if (data) {
        this.templatesList = data;
        for(var item of this.templatesList){
          item.statusColor = item.active ? "success":"danger";
          item.status = item.active ? "Active":"Inactive";
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });
  }
  
  edit(id:any) {
    this.action = "edit";
    this.details = Object.assign({}, this.templatesList.find((x:any)  => x.smsTemplateId == id));
  }

  delete(id:any) {
    if (confirm("Are you sure you want to Inactivate this?")) {
      this.action = "edit";
      this.details = Object.assign({}, this.templatesList.find((x:any)  => x.smsTemplateId == id));
      this.details.active = false;
      this.submit();
    }
  }

  submit() {
    let connection: any;

    this.isLoading = true;   
    if(this.action == "edit")
      connection = this.httpService.HRput(APIURLS.SMS_TEMPLATES_API, this.details.smsTemplateId, this.details);
    else 
      connection = this.httpService.HRpost(APIURLS.SMS_TEMPLATES_API, this.details);

    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data) {
          toastr.success('Saved successfully!');
          this.action = "add";
          this.details = {};
          this.GetTemplatesList();
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + error);
      });
  }

  cancel() {
    this.action = "add";
    this.details = {};
  }
}
