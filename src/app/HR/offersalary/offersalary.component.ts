import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { Util } from '../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-hr-offer-offersalary',
  templateUrl: './offersalary.component.html',
  styleUrls: ['./offersalary.component.css'],
  providers: [Util]
})

export class OfferSalaryComponent implements OnInit {
  @Input() offerId: number;
  @Input() packageType: string;
  @Input() editAllowed: boolean = true;
  @Input() offeredSalary: number;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  currentUser: AuthData;
  isLoading: boolean;
  details: any = {};
  salaryList: any[] = [];
  count = 0;
  salaryHeads: any[] = [];
  allowanceDetails: any;
  salaryDetails:any[] = [];
  salaryDetailsHead="";
  benefitsList: any[] =[];
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppService, private util: Util) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));     
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.isLoading = true; 
      this.getSalaryHeadsList();  
     this.details.calculateCTC = this.offeredSalary;   
     this.details.monthlyGross = this.offeredSalary;  
    }
  }

  
  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.OFFER_GETOFFERSALARYHEADDETAILS + "/" + this.offerId).then((data: any) => {
      if (data) {
        if(data != null ){
          this.dataLoaded.emit(data);
          this.salaryList = data;        
          var index=0;          
          for(var item of this.salaryList){
            this.onSalaryHeadChange(index);
            index++;
          }
          this.benefitsList = this.salaryList.filter(x=>x.salaryTypeShortCode == 'B'); 
          this.salaryList = this.salaryList.filter(x=>x.salaryTypeShortCode != 'B');   
          this.calculateTotals();        
        }          
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
    });
  }  

  saveData(){
    if(this.editAllowed == false) this.dataSaved.emit(200);;

    if(!this.checkZeroOrEmpty()) return;

    if(this.checkDuplicates()){
      toastr.error("Duplicate salary heads not allowed. Please change it.");
      return;
    }
    if(this.benefitsList.length <=0){
      toastr.error("There are no Other benefits added, please click Calculate Other benefits.");
      return;
    }    

    let connection: any;
    //this.isLoading = true;
    this.details.offerId = this.offerId;
    this.details.salaryHeadDetails = this.salaryList.concat(this.benefitsList);
    connection = this.httpService.HRpost(APIURLS.OFFER_SAVEOFFERSALARYDETAILS, this.details);
    
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
        toastr.error('Error occured while saving the details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + error);
      });
  }

  calculateTotals(){
    this.details.totalIncome = 0;
    this.details.totalDeductions = 0;
    this.details.totalOtherBenefits = 0;
    this.details.totalReimbursements = 0;
    this.details.totalVariablePay = 0;
    this.details.totalOnetime = 0;
    this.details.monthlyGrossTotal = 0;

    for(var i=0; i < this.salaryList.length; i++){
      var salaryHeadId = this.salaryList[i].salaryHeadId;
      if(salaryHeadId >0){
        var head = this.salaryHeads.find(x=>x.id == salaryHeadId);
        if(head){
          var payableNoOfMonths = this.frequencyValues.find(x=>x.type == head.salaryPayableFrequency).value;
          this.salaryList[i].annualAmount = this.salaryList[i].amount * payableNoOfMonths;

          if(head.salaryType == "I" && head.salaryPayableFrequency == 'M')
            this.details.monthlyGrossTotal += this.salaryList[i].amount * 1;

          if(head.salaryType == "I")
            this.details.totalIncome += this.salaryList[i].annualAmount;
          else if(head.salaryType == "D")
            this.details.totalDeductions += this.salaryList[i].annualAmount;        
          else if(head.salaryType == "R")
            this.details.totalReimbursements += this.salaryList[i].annualAmount;
          else if(head.salaryType == "V")
            this.details.totalVariablePay += this.salaryList[i].annualAmount;
          else if(head.salaryType == "O")
            this.details.totalOnetime += this.salaryList[i].annualAmount;
        }
      }
    }
    for(var i=0; i < this.benefitsList.length; i++){
      var salaryHeadId = this.benefitsList[i].salaryHeadId;
      if(salaryHeadId >0){
        var head = this.salaryHeads.find(x=>x.id == salaryHeadId);
        if(head && head.salaryType == "B")
          this.details.totalOtherBenefits += this.benefitsList[i].annualAmount;
      }
    }
    this.details.totalCTC = this.details.totalIncome + this.details.totalReimbursements + this.details.totalOtherBenefits;
  }

  getCTCBreakup(){
    this.isLoading = true;

    this.httpService.HRget(APIURLS.OFFER_GET_CTC_BREAKUP + "/" + this.offerId + "/"+this.details.calculateCTC).then((data: any) => {
      if (data) {
        this.salaryList = data.salaryHeadDetails;
        var index=0;
        for(var item of this.salaryList){
          this.onSalaryHeadChange(index);
          index++;
        }             
        this.benefitsList = this.salaryList.filter(x=>x.salaryTypeShortCode == 'B'); 
        this.salaryList = this.salaryList.filter(x=>x.salaryTypeShortCode != 'B'); 
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details.");
    });
  }

  getCTCBreakupOnGross(){
    this.isLoading = true;

    this.httpService.HRget(APIURLS.OFFER_GET_CTC_BREAKUP_ON_GROSS + "/" + this.offerId + "/"+this.details.monthlyGross+"/"+this.packageType).then((data: any) => {
      if (data) {
        this.salaryList = data.salaryHeadDetails;
        var index=0;
        for(var item of this.salaryList){
          this.onSalaryHeadChange(index);
          index++;
        }             
        this.benefitsList = this.salaryList.filter(x=>x.salaryTypeShortCode == 'B'); 
        this.salaryList = this.salaryList.filter(x=>x.salaryTypeShortCode != 'B'); 
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details.");
    });
  }

  getOtherBenefits(){
    if(this.salaryList.length ==0){
      toastr.error("Please add income details.");
      return;
    }
    this.isLoading = true;

    this.httpService.HRpost(APIURLS.OFFER_GETOTHERBENEFITS+ "/"+this.offerId, this.salaryList).then((data: any) => {
      if (data) {
        this.benefitsList = data;
        var index=0;
        for(var item of this.benefitsList){
          var lineItem = this.benefitsList[index];      
          var head = this.salaryHeads.find(x=>x.id == lineItem.salaryHeadId);
          if(head){
            this.benefitsList[index].description = head.descriptionInPaySlip;
            this.benefitsList[index].salaryType = this.headTypes.find(x => x.type == head.salaryType).value;
            this.benefitsList[index].salaryTypeShortCode = head.salaryType;
            this.benefitsList[index].frequency = this.frequency.find(x => x.type == head.salaryPayableFrequency).value;
          }
          index++;
        }  
        this.calculateTotals();      
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while gettting details.");
      this.details = {};
    });
  }

  showDetails(type, title){
    this.salaryDetailsHead = title;
    if(type == "All"){
      this.salaryDetails = this.salaryList;      
    }
    else if(type == "B"){
      this.salaryDetails = this.benefitsList;      
    }
    else{
      this.salaryDetails = this.salaryList.filter(x=>x.salaryTypeShortCode == type);      
    }
    $("#salaryDetailsModal").modal("show");
  }

  headTypes = [{ type: "I", value: "Income" }, { type: "D", value: "Deduction" }, { type: "R", value: "Reimbursement" }, {type:"V", value:"Variable Pay"}, {type:"O", value:"One Time"}, { type: "B", value: "Other Benefit" }];
  frequency = [{ type: "M", value: "Monthly" }, { type: "Q", value: "Quarterly" }, { type: "H", value: "Half-Yearly" }, { type: "A", value: "Annually" }, { type: "D", value: "Daily" }, { type: "O", value: "One Time" }];
  frequencyValues = [{ type: "M", value: 12 }, { type: "Q", value: 4 }, { type: "H", value: 2 }, { type: "A", value: 1 }, { type: "O", value: 1 }];

  onSalaryHeadChange(index){
    if(index >= 0){
      var lineItem = this.salaryList[index];      
      var head = this.salaryHeads.find(x=>x.id == lineItem.salaryHeadId);
      if(head){
        this.salaryList[index].description = head.descriptionInPaySlip;
        this.salaryList[index].salaryType = this.headTypes.find(x => x.type == head.salaryType).value;
        this.salaryList[index].salaryTypeShortCode = head.salaryType;
        this.salaryList[index].frequency = this.frequency.find(x => x.type == head.salaryPayableFrequency).value;
      }
    }
  }




 

  checkDuplicates(){
    var foundDuplicate = false;
    for(var i=0; i < this.salaryList.length; i++){
      if(this.salaryList.findIndex(x=>x.salaryHeadId == this.salaryList[i].salaryHeadId) != i){
        foundDuplicate = true;
      }
    }
    return foundDuplicate;
  }

  checkZeroOrEmpty(){
    for(var i=0; i < this.salaryList.length; i++){
      if(this.salaryList[i].amount == null || this.salaryList[i].amount == undefined || this.salaryList[i].amount == '' || this.salaryList[i].amount == 0){
        toastr.error(this.salaryList[i].description + " Amount cannot be empty or zero, please enter a value");
        return false;
      }
    }
    return true;
  }



  getSalaryHeadsList() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SALARY_HEADS).then((data: any) => {
      debugger;
      if (data.length > 0) {
        this.salaryHeads = data.sort((a, b) => { if (a.salaryLT > b.salaryLT) return 1; if (a.salaryLT < b.salaryLT) return -1; return 0; });        
        for (var head of this.salaryHeads) {
          head.salaryTypeDescription = this.headTypes.find(x => x.type == head.salaryType).value;
        }
        this.LoadData();
      }
    }).catch(error => {
      this.salaryHeads = [];
    }); 
  }

  onAddLineClick(){    
    this.salaryList.push({});
    this.count++;
  }

  RemoveLine(no){
    var salaryHeadId = this.salaryList[no].salaryHeadId;
    // clear out the payable values
    this.salaryList.splice(no,1);
    this.count--;
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
