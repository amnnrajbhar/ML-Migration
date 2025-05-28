import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-exit-interview',
  templateUrl: './exit-interview.component.html',
  styleUrls: ['./exit-interview.component.css'],
  providers: [Util]
})
export class ExitInterviewComponent implements OnInit {
  @Input() resignationId: any;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  
  currentUser!: AuthData;
  urlPath: string = '';
  isLoading = false;
  questions: any[] = [];
  resignationDetails:any = {};
  errMsg: string = "";
  isAnswered = false;
  isDeclared = false;
  guid: string = '';

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (this.resignationId==undefined)
      {
        this.resignationId = this.route.snapshot.paramMap.get('id')!; 
        this.guid = this.route.snapshot.paramMap.get('id2')!; 
      }
      this.GetData();
    }
  }

  GetData() {   
    console.log(this.resignationId);
    if(this.resignationId && this.resignationId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.RESIGNATION_GET_EXIT_INTERVIEW_ANSWERS+"/"+ this.resignationId).then((data: any) => {
        if (data) {
          this.questions = data;
          this.isAnswered = (data.filter((x:any)=>x.answer != "" && x.answer != null && x.answer != undefined).length > 0);
          this.editAllowed = !this.isAnswered;
          this.isDeclared = this.isAnswered;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.errMsg = "Error occurred while fetching details, please check the link.";
      });
    }
  }
  
  SaveData(){
    if(!this.Validate()) return;

    let connection: any;
    this.isLoading = true;        

    connection = this.httpService.HRpost(APIURLS.RESIGNATION_SAVE_EXIT_INTERVIEW_ANSWERS+"/"+this.resignationId+"/"+this.currentUser.uid, this.questions);
    
    toastr.info('Submitting...');

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details submitted successfully!');
          this.editAllowed= false;
          this.isAnswered = true;
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while submitting details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while submitting details. Error:' + error);
      });
  }

  Validate(){    
    
    for(var item of this.questions){
      if(item.isMandatory){
        if(item.answer == null || item.answer == undefined || item.answer == ""){
          if(item.options == null || item.options == undefined || item.options.length == 0){
            toastr.error("Please answer the question: "+item.questionId +" "+ item.questionText+" It is mandatory.");
            return false;
          }else{
            var isAnswered = false;
            for(var opt of item.options){
              if(opt.isSelected && opt.isSelected == true && opt.takeTextInput == true && 
                (opt.textInput == null || opt.textInput == undefined || opt.textInput == "")){
                  toastr.error("Please enter details for the question: "+item.questionId +" option: "+ opt.optionText+".");
                  return false;
              }
              if(opt.isSelected && opt.isSelected == true)
                isAnswered = true;               
            }
            if(isAnswered == false && item.questionType == "Checkbox"){
              toastr.error("Please select atleast one option for the question: "+item.questionId +" It is mandatory.");
              return false;
            }
            else if(isAnswered == false && item.questionType == "Dropdown"){
              toastr.error("Please select a value for the question: "+item.questionId +" It is mandatory.");
              return false;
            }
          }          
        }
      }
    } 
    if(this.isDeclared == false){
      toastr.error("Please check the declaration checkbox to submit the details.");
      return false;
    }
    return true;
  }

}
