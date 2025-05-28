import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import swal from 'sweetalert';
declare var toastr: any;

@Component({
  selector: 'app-appointment-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css'],
  providers: [AppointmentService]
})
export class LanguagesComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() offerId!: number;
  @Input() guid: string  
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  languageList: any[] = [];
  languageTypes: any[] = [];
  count: number = 0;
  isLoading: boolean = false;
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService) { }

  ngOnInit() {    
    this.service.getLanguages().then((data:any)=>{this.languageTypes = data;});
    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_LANGUAGE_DETAILS + "/" + this.appointmentId);
    else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_LANGUAGE_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data && data.length > 0) {
        this.languageList = data;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.languageList = [];
    });
  }
  
  saveData(){
    let connection: any;
    //this.isLoading = true;
    let data: any = {};
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.list = this.languageList;
    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_LANGUAGE_DETAILS, data);
    else
      connection = this.service.postData(APIURLS.CANDIDATE_SAVE_LANGUAGE_DETAILS, data);

      toastr.info('Saving...');

    connection.then(
      (data: any) => {
        //this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        //this.isLoading = false;
        toastr.error('Error occured while saving address details. Error:' + err);
      })
      .catch((error)=> {
        //this.isLoading = false;
        toastr.error('Error occured while saving address details. Error:' + error);
      });
  }

  onAddLineClick(){    
    this.languageList.push({});
    this.count++;
  }

  RemoveLine(no){
    this.languageList.splice(no,1);
    this.count--;
  }

}
