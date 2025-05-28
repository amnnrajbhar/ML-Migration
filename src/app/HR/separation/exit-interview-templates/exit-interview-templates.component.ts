import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Resignation } from '../resignation/resignation.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { CompleteResignationTaskRequest } from '../pending-resignation/completeResignationTaskRequest.model';
import { PendingTaskModel } from '../pending-resignation/pendingTaskModel.model';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-exit-interview-templates',
  templateUrl: './exit-interview-templates.component.html',
  styleUrls: ['./exit-interview-templates.component.css']
})
export class ExitInterviewTemplatesComponent implements OnInit {

  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  templatesList: any[] = [];
  selectedTemplateId: any = 0;
  templateName:any = "";
  questions: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.getTemplates();
    }
  }


  getTemplates() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.RESIGNATION_GET_PRINT_TEMPLATES + "/Exit Interview").then((data: any) => {
      if (data.length > 0) {
        this.templatesList = data.sort((a:any, b:any) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  GetDetails() {
    if (!this.selectedTemplateId || this.selectedTemplateId <= 0) {
      toastr.error("Please select a template to get details.");
      return;
    }
    this.isLoading = true;

    this.httpService.HRget(APIURLS.RESIGNATION_GET_EXIT_INTERVIEW_QUESTIONS + "/" + this.selectedTemplateId).then((data: any) => {
      if (data) {
        this.questions = data;
        this.templateName = this.templatesList.find(x=>x.printTemplateId == this.selectedTemplateId).templateName;
      }      
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.errMsg = error;
    });
  }

  onSaveClick(){
    let connection: any;
    this.isLoading = true;
    
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_SAVE_EXIT_INTERVIEW_QUESTIONS+"/"+this.selectedTemplateId+"/"+this.templateName, this.questions);
    
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');

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

  addNewClick(){
    this.questions.push({});
  }

  addNewOption(i){
    if(this.questions[i].options == null || this.questions[i].options == undefined)
      this.questions[i].options = [];

    this.questions[i].options.push({});
  }

  deleteQuestion(i){
    this.questions.splice(i, 1);
  }

  deleteOption(i, j){
    this.questions[i].options.splice(j, 1);
  }

}
