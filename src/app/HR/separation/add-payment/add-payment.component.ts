import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { Resignation } from '../../separation/resignation/resignation.model';
import { AuthData } from '../../../auth/auth.model';
import { MOMENT } from 'angular-calendar';
import moment from 'moment'
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.css'],
  providers:[Util],
})
export class AddPaymentComponent implements OnInit {
  currentUser!: AuthData;
  employeeId: any;
  resignationId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = false;
  resignationDetails = {} as Resignation;
  lastWorkingDate: any;
  resignationDate: any;
  actualLastDate: any;
  noticePeriod :any;
  DateToday :Date;
  settlementTypeList = [{ type: "Release with short notice period" },{ type: "Deduction in Settlement" }, { type: "Payment to be done" }];  
  paymodeList = [{ type: "Demand Draft(DD)" },{ type: "Online Payment" }, { type: "Cheque" }]; 
  transferModeList = [{ type: "NEFT" },{ type: "RTGS" }, { type: "IMPS" }, { type: "Google Pay" }, { type: "Phone Pe" }, { type: "Paytm" }, { type: "Others" }];   
  files: any[] = [];
  settlementSelected = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private fb: FormBuilder,
    private util: Util,private location: Location) {
    }

  ngOnInit() {
    this.DateToday=new Date();
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.resignationId = this.route.snapshot.paramMap.get('id')!; 
    this.employeeId = this.route.snapshot.paramMap.get('id1')!; 
    this.GetResignationDetailsById(this.resignationId);
  }

  GetResignationDetailsById(id:any) {
    this.isLoading = true;
   
    this.httpService.HRget(APIURLS.RESIGNATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.resignationDetails=data;
         this.employeeId = data.employeeId;
         this.lastWorkingDate = this.getDateFormate(this.resignationDetails.lastWorkingDate);
         this.resignationDate = this.getDateFormate(this.resignationDetails.resignationDate);
         this.actualLastDate = this.getDateFormate(this.resignationDetails.expectedLastWorkingDate);
         this.noticePeriod = this.resignationDetails.noticePeriod+' Month(s)';
         if(this.resignationDetails.payAmount > 0){
           this.settlementSelected = true;
         }
         if(this.resignationDetails.receiptDate == undefined)
          this.resignationDetails.receiptDate = this.DateToday;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.errMsg= error;
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
  selectFiles(event) {
    this.files = event.target.files;
  }
  goBack()
  {
    this.location.back();
  }
  submit() {
    for (const file of this.files) {
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
    }
   this.updatePayment();
  }
    updatePayment()
    {
      
    this.resignationDetails.modifiedById = this.currentUser.uid;
    this.resignationDetails.modifiedDate = new Date();

    this.isLoading = true;
    let connection: any;
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_UPDATE, this.resignationDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success('Details updated successfully!');
          this.addAttachments();
          this.router.navigate(['/HR/separation/payment-list']);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while editing resignation details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while editing resignation details. Error:' + error);
      });
  }
  addAttachments(){

    if(this.files.length > 0){
      
      const formData = new FormData();  
      var index =0;
      for (const file of this.files) {      
        formData.append("attachments["+index+"]", file);        
        index++;
      }
      this.isLoading = true;      
      toastr.info("Uploading attachment files ...");  
      this.httpService.HRpostAttachmentFile(APIURLS.RESIGNATION_ADD_ATTACHMENTS+"/"+this.resignationDetails.resignationId, formData)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          { 
            toastr.success('Files uploaded successfully!');
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
}
