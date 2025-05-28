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
  selector: 'app-appointment-nomination',
  templateUrl: './nomination.component.html',
  styleUrls: ['./nomination.component.css'],
  providers: [AppointmentService]
})
export class NominationComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() offerId!: number;
  @Input() guid: string  
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  nominationList: any[] = [];
  count: number = 0;
  isLoading: boolean = false;
  pfApplicable: boolean = true;
  esiApplicable: boolean = true;
  gratuityApplicable: boolean = true;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService) { }

  ngOnInit() {    
    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_NOMINATION_DETAILS + "/" + this.appointmentId);
    else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_NOMINATION_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data && data.length > 0) {
        this.nominationList = data;
        this.GetDetails();
        this.dataLoaded.emit("loaded");
        
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
    });
  }

  GetDetails(){
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
    conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_STATUTORY_DETAILS + "/" + this.appointmentId);
  else
    conn = this.service.getData(APIURLS.CANDIDATE_GET_OFFER_BY_ID + "/" + this.offerId + "/" + this.guid);

  conn.then((data: any) => {
    if (data) {
      if(this.appointmentId > 0){
        this.pfApplicable = data.pfDeduction == "Yes";
        this.esiApplicable = data.esiDeduction == "Yes";
        this.gratuityApplicable = data.gratuity == "Yes";
      }
      else{
        this.pfApplicable = data.pfApplicable == "Yes";
        this.esiApplicable = data.esiApplicable == "Yes";
      }
    }
    this.isLoading = false;
  }).catch((error)=> {
    this.isLoading = false;
    toastr.error("Error occurred while fetching details, please check the link.");
  });
  }
  
  saveData(){
    let connection: any;
    //this.isLoading = true;
    let data: any = {};
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.list = this.nominationList;
    var pfPercAllocated =0;
    var esiPercAllocated =0;
    var grPercAllocated =0;
    for(var i=0; i < this.nominationList.length; i++){
        pfPercAllocated += this.nominationList[i].pfPercent*1;
        esiPercAllocated += this.nominationList[i].esiPercent*1;
        grPercAllocated += this.nominationList[i].gratuityPercent*1;
    }
    if(this.pfApplicable == true && pfPercAllocated != 100){
      toastr.error("Total PF Percent allocated should be 100%, please revise the values.");
      return;
    }
    if(this.esiApplicable == true && esiPercAllocated != 100){
      toastr.error("Total ESI/GPA Percent allocated should be 100%, please revise the values.");
      return;
    }
    if(this.gratuityApplicable == true && grPercAllocated != 100){
      toastr.error("Total Gratuity Percent allocated should be 100%, please revise the values.");
      return;
    }

    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_NOMINATION_DETAILS, data);
    else
      connection = this.service.postData(APIURLS.CANDIDATE_SAVE_NOMINATION_DETAILS, data);

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
        toastr.error(data.message);
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

}
