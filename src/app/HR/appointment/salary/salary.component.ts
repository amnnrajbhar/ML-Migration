import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appointment-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css'],
  providers: [AppointmentService, Util]
})

export class SalaryComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  currentUser!: AuthData;
  isLoading!: boolean;
  salaryTypes = [{ type: "Annual" }, { type: "Monthly" }];
  packageTypes = [{ type: "Annual CTC" }, { type: "Monthly Gross" }, { type: "Monthly Takehome" }];
  officialDetails: any = {};
  details: any = {};
  statutoryDetails: any = {};
  salaryList: any[] = [];
  payableList: any[] = [];
  count = 0;
  allowanceList: any[] = [];
  salaryHeads: any[] = [];
  allowanceDetails: any;
  salaryDetails:any[] = [];
  salaryDetailsHead="";
  benefitsList: any[] =[];
  allowSalaryChange: boolean = true;
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;     
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.isLoading = true;
      this.getOfficialData();      
      this.getSalaryHeadsList();      
      this.LoadStatutoryDetails();
    }
  }

  
  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SALARY_DETAILS + "/" + this.appointmentId).then((data: any) => {
      if (data) {
        this.details = data;
        this.details.calculateCTC = data.offeredSalary;
        this.details.monthlyGross = data.offeredSalary;
        //this.allowSalaryChange = (data.offeredSalary == null || data.offeredSalary == undefined || data.offeredSalary == 0);

        if(data != null && data.appointmentId > 0){
          this.dataLoaded.emit(data.status);
          this.salaryList = data.headDetails;
          this.payableList = data.payableDetails;          
          var index=0;          
          for(var item of this.salaryList){
            this.onSalaryHeadChange(index);
            index++;
          }
          this.benefitsList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode == 'B'); 
          this.salaryList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode != 'B');           
          this.onAllowanceChange();          
          this.calculateTotals();
        }          
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      throw error;
    });
  }  

  
  LoadStatutoryDetails() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_STATUTORY_DETAILS + "/" + this.appointmentId).then((data: any) => {
      if (data) {
        this.statutoryDetails = data;                
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.statutoryDetails = {};
    });
  }

  saveData(){
    // if(!this.personalDetailsForm.form.valid) 
    // {
    //   swal("Please enter all mandatory fields."); 
    //   return;
    // }
    if(this.officialDetails.employeeCategoryId == 2 && this.details.allowanceId <=0) // Field Staff
    {
      toastr.error("Please select Allowance Type");
      return;
    }
    
    if(!this.checkZeroOrEmpty()) return;

    if(this.checkDuplicates()){
      toastr.error("Duplicate salary heads not allowed. Please change it.");
      return;
    }
    
    if(!this.checkPayables()) return;

    if(this.statutoryDetails && (this.statutoryDetails.bonusPay=='Yes' || this.statutoryDetails.gratuity=='Yes' || this.statutoryDetails.pfDeduction=='Yes') 
    && this.benefitsList.length <=0){
      toastr.error("There are no Other benefits added, please click Calculate Other benefits.");
      return;
    }
    
    if(this.details.packageType == 'CTC' && (this.details.totalCTC < this.details.offeredSalary || this.details.totalCTC > this.details.offeredSalary+100)){
      toastr.error("The Total CTC should be between "+this.details.offeredSalary+" and "+(this.details.offeredSalary+100));
      return;
    }

    if(this.details.packageType == 'Gross' && (this.details.monthlyGrossTotal < this.details.monthlyGross || this.details.monthlyGrossTotal > this.details.monthlyGross+100)){
      toastr.error("The Total Monthly Gross should be between "+this.details.monthlyGross+" and "+(this.details.monthlyGross+100));
      return;
    }

    let connection: any;
    //this.isLoading = true;
    this.details.appointmentId = this.appointmentId;
    this.details.updatedById = this.currentUser.uid;
    this.details.headDetails = this.salaryList.concat(this.benefitsList);
    this.details.payableDetails = this.payableList.filter((x:any)  => this.salaryList.some(y =>y.salaryHeadId ==  x.salaryHeadId));
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_SALARY_DETAILS, this.details);
    
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
      .catch((error)=> {
        //this.isLoading = false;
        toastr.error('Error occured while saving the details. Error:' + error);
      });
  }


  getCTCBreakup(){
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_CTC_BREAKUP + "/" + this.appointmentId + "/"+this.details.calculateCTC).then((data: any) => {
      if (data) {
        this.salaryList = data.headDetails;
        var index=0;
        for(var item of this.salaryList){
          this.onSalaryHeadChange(index);
          index++;
        }             
        this.benefitsList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode == 'B'); 
        this.salaryList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode != 'B');         
        this.calculateTotals();

        // if salary head is annual type then add March as default payable month
        for(var item of this.salaryList){
          var head = this.salaryHeads.find(x=>x.id == item.salaryHeadId);          
          if(head && head.salaryPayableFrequency == "A" && this.payableList.filter((x:any)=>x.salaryHeadId == item.salaryHeadId).length <= 0)
            this.payableList.push({month:"March", payable: true, salaryHeadId: item.salaryHeadId, appointmentId: this.appointmentId});
        }          
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details.");
    });
  }

  getCTCBreakupOnGross(){
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_CTC_BREAKUP_ON_GROSS + "/" + this.appointmentId + "/"+this.details.monthlyGross+"/"+this.details.packageType).then((data: any) => {
      if (data) {
        this.salaryList = data.headDetails;
        var index=0;
        for(var item of this.salaryList){
          this.onSalaryHeadChange(index);
          index++;
        }             
        this.benefitsList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode == 'B'); 
        this.salaryList = this.salaryList.filter((x:any)=>x.salaryTypeShortCode != 'B'); 
        this.calculateTotals();

        // if salary head is annual type then add March as default payable month
        for(var item of this.salaryList){
          var head = this.salaryHeads.find(x=>x.id == item.salaryHeadId);          
          if(head && head.salaryPayableFrequency == "A" && this.payableList.filter((x:any)=>x.salaryHeadId == item.salaryHeadId).length <= 0)
            this.payableList.push({month:"March", payable: true, salaryHeadId: item.salaryHeadId, appointmentId: this.appointmentId});
        }       
      }
      this.isLoading = false;
    }).catch((error)=> {
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

    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_OTHER_BENEFITS+ "/"+this.appointmentId, this.salaryList).then((data: any) => {
      if (data) {
        this.benefitsList = data;
        var index=0;
        for(var item of this.benefitsList){
          var lineItem = this.benefitsList[index];      
          var head = this.salaryHeads.find(x=>x.id == lineItem.salaryHeadId);
          if(head){
            this.benefitsList[index].description = head.descriptionInPaySlip;
            this.benefitsList[index].salaryType = this.headTypes.find((x:any)  => x.type == head.salaryType).value;
            this.benefitsList[index].salaryTypeShortCode = head.salaryType;
            this.benefitsList[index].frequency = this.frequency.find((x:any)  => x.type == head.salaryPayableFrequency).value;
          }
          index++;
        }        
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while gettting details.");
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
      this.salaryDetails = this.salaryList.filter((x:any)=>x.salaryTypeShortCode == type);      
    }
    $("#salaryDetailsModal").modal("show");
  }

  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"O", value:"One Time"},{type:"B", value:"Other Benefit"}, {type:"V", value:"Variable Pay"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];
  frequencyValues = [{type:"M", value:12}, {type:"Q", value:4}, {type:"H", value:2}, {type:"A", value:1}, {type:"O", value:1}];

  onSalaryHeadChange(index){
    if(index >= 0){
      var lineItem = this.salaryList[index];      
      var head = this.salaryHeads.find(x=>x.id == lineItem.salaryHeadId);
      if(head){
        this.salaryList[index].description = head.descriptionInPaySlip;
        this.salaryList[index].salaryType = this.headTypes.find((x:any)  => x.type == head.salaryType).value;
        this.salaryList[index].salaryTypeShortCode = head.salaryType;
        this.salaryList[index].frequency = this.frequency.find((x:any)  => x.type == head.salaryPayableFrequency).value;
      }
    }
  }

  payableSelectedIndex = -1;
  payableSelectedHead = "";
  payableSelectedList = [{month:"April", payable:false}, {month:"May", payable:false}, {month:"June", payable:false},
  {month:"July", payable:false},{month:"August", payable:false},{month:"September", payable:false},
  {month:"October", payable:false},{month:"November", payable:false},{month:"December", payable:false},
  {month:"January", payable:false},{month:"February", payable:false},{month:"March", payable:false}];

  onPayableSelect(index){
    this.payableSelectedIndex = index;
    this.payableSelectedHead = this.salaryHeads.find((x:any)  => x.id == this.salaryList[index].salaryHeadId).salaryLT;
    var salaryHeadId = this.salaryList[this.payableSelectedIndex].salaryHeadId;
    for(var item of this.payableSelectedList){
      var data = this.payableList.find(x=>x.month == item.month && x.salaryHeadId == salaryHeadId);
      if(data)
        item.payable =  data.payable;
      else 
        item.payable = false;
    }
    $("#payableModal").modal("show");
  }

  onPayableSave(){
    var salaryHeadId = this.salaryList[this.payableSelectedIndex].salaryHeadId;
    var head = this.salaryHeads.find(x=>x.id == salaryHeadId);
    var payableNoOfMonths = this.frequencyValues.find(x=>x.type == head.salaryPayableFrequency).value;
    
    if(this.payableSelectedList.filter((x:any)=>x.payable).length != payableNoOfMonths){
      swal("Please select "+ payableNoOfMonths + " months.");
      return;
    }
    // clear out old values
    this.payableList = this.payableList.filter((x:any)  =>x.salaryHeadId != salaryHeadId);
    for(var item of this.payableSelectedList){
      if(item.payable)
        this.payableList.push({month:item.month, payable: item.payable, salaryHeadId: salaryHeadId, appointmentId: this.appointmentId});
    }
    $("#payableModal").modal("hide");
  }

  onAllowanceChange(){
    var allowance = this.allowanceList.find((x:any)  => x.id == this.details.allowanceId);
    if(allowance)
      this.allowanceDetails = "HQ:"+allowance.hq + " HS:"+allowance.hs + " IA:"+allowance.ia + " MA:"+allowance.ma + " OS:"+allowance.os + " SA:"+allowance.sa+" EXHQ:"+allowance.exhq;
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
  
  checkPayables(){
    var valid = true;
    for(var i=0; i < this.salaryList.length; i++){
      var salaryHeadId = this.salaryList[i].salaryHeadId;
      var head = this.salaryHeads.find(x=>x.id == salaryHeadId);
      var payableNoOfMonths = this.frequencyValues.find(x=>x.type == head.salaryPayableFrequency).value;
      if(payableNoOfMonths != 12){
        if(this.payableList.filter((x:any)  =>x.salaryHeadId == salaryHeadId && x.payable == true).length != payableNoOfMonths){
          toastr.error("Please select "+ payableNoOfMonths + " payable month(s) for "+head.salaryLT+".");
          valid = false;
        }
      }
    }
    return valid;
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
          else if (head.salaryType == "O")
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

  getOfficialData(){
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_OFFICIAL_DETAILS + "/" + this.appointmentId).then((data: any) => {
      if (data) {
        this.officialDetails = data;
        this.getAllowanceList();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error("Error occurred while fetching official details.");
      this.officialDetails = {};
    });
  }

  getAllowanceList() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ALLOWANCE_TYPES+ "?plantId="+this.officialDetails.plantId+"&payGroupId="+this.officialDetails.payGroupId+"&empCategoryId="+this.officialDetails.employeeCategoryId+"&designationId="+this.officialDetails.designationId+"&isMetro="+this.officialDetails.isMetroCity)
    .then((data: any) => {
      if (data.length > 0) {
        this.allowanceList = data.sort((a:any, b:any) => { if (a.allowanceType > b.allowanceType) return 1; if (a.allowanceType < b.allowanceType) return -1; return 0; });        
        this.onAllowanceChange();
      }
    }).catch((error)=> {
      this.allowanceList = [];
    }); 
  }

  getSalaryHeadsList() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SALARY_HEADS).then((data: any) => {
      if (data.length > 0) {
        this.salaryHeads = data.sort((a:any, b:any) => { if (a.salaryLT > b.salaryLT) return 1; if (a.salaryLT < b.salaryLT) return -1; return 0; });        
        for (var head of this.salaryHeads) {
          head.salaryTypeDescription = this.headTypes.find((x:any)  => x.type == head.salaryType).value;
        }
        this.LoadData();
      }
    }).catch((error)=> {
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
    this.payableList = this.payableList.filter((x:any)  =>x.salaryHeadId != salaryHeadId);
    this.salaryList.splice(no,1);
    this.count--;
    this.calculateTotals();
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
