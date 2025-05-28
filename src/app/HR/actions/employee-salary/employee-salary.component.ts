import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-employee-salary',
  templateUrl: './employee-salary.component.html',
  styleUrls: ['./employee-salary.component.css']
})



export class EmployeeSalaryComponent implements OnInit {
  @Input() employeeId!: number;
  @Input() employeeInitialAppraisalDetailId!: number;
  @Input() isSalaryChange: any;
  @Input() packageType: string
  @Input() editAllowed: boolean = true;
  @Input() offeredSalary!: number;
  @Input() salaryType: string
  @Input() salaryAmount!: number;
  @Input() oneTimeSalaryType: string
  @Input() oneTimeSalaryAmount!: number;
  @Input() newDesignationId!: number;
  @Input() newPlantId!: number;
  @Input() newPayGroupId!: number;
  @Input() newEmployeeCategoryId!: number;
  @Input() effectiveDate: string
  @Output() dataSaved: EventEmitter<any> = new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> = new EventEmitter();

  currentUser!: AuthData;
  isLoading!: boolean;
  details: any = {};
  salaryList: any[] = [];
  count = 0;
  salaryHeads: any[] = [];
  allowanceDetails: any;

  salaryDetails: any[] = [];
  salaryDetailsHead = "";
  benefitsList: any[] = [];
  currentMonthlyGross = 0;
  allowanceList: any[] = [];
  employeeDetails: any = {};

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppService, private util: Util) { }

  ngOnInit() {
    //this.employeeId = 25;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.isLoading = true;
      this.getSalaryHeadsList();
      this.GetEmployeeDetails();
      //this.details.revisedSalaryType = "newCTC";

      this.details.revisedSalaryType = this.salaryType;
      this.details.revisedAmount = this.salaryAmount;
      this.details.oneTimeSalaryType = this.oneTimeSalaryType;
      this.details.oneTimeSalaryAmount = this.oneTimeSalaryAmount;
    }
  }

  LoadData() {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_APPRAISAL_DETAILS, this.employeeInitialAppraisalDetailId).then((data: any) => {
      if (!data || !data.appraisalSalaryHeadDetails || data.appraisalSalaryHeadDetails.length <= 0)
        this.LoadEmpSalaryData();
        console.log("INSIDE");
      this.salaryList = data.appraisalSalaryHeadDetails;
      if (data.appraisalSalaryHeadDetails && data.appraisalSalaryHeadDetails.length > 0) {
        var index = 0;
        if (this.salaryList && this.salaryList.length > 0) {
          for (var item of this.salaryList) {
            item.startDate = new Date(this.effectiveDate);
            console.log(this.effectiveDate);
            this.onSalaryHeadChange(index);
            index++;
          }
        }
        this.benefitsList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode == 'B');
        this.salaryList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode != 'B');
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  LoadEmpSalaryData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_SALARY_DETAILS + "/" + this.employeeId).then((data: any) => {
      if (data) {
        this.dataLoaded.emit(data);
        this.details.allowanceId = data.allowanceId;
        this.onAllowanceChange();
        if(data.headDetails)
          this.salaryList = data.headDetails;

        if (data.headDetails && data.headDetails.length > 0) {
          var index = 0;
          if (this.salaryList && this.salaryList.length > 0) {
            for (var item of this.salaryList) {
              item.startDate = new Date(this.effectiveDate);
              this.onSalaryHeadChange(index);
              index++;
            }
          }
          this.benefitsList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode == 'B');
          this.salaryList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode != 'B');
          this.calculateTotals();
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      swal("Error occurred while fetching details, please check the link.");
    });
  }

  GetEmployeeDetails() {
    this.isLoading = true;
    // this.isVisible=false;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API,  this.employeeId).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        this.getAllowanceList();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }

  disableAllowance = false;
  getAllowanceList() {
    console.log('insideallowance');
    console.log(this.newPlantId);
    if(this.newPlantId == null || this.newPlantId.toString() == '')
    {
      this.newPlantId  = this.employeeDetails.plantId;
    }
    if(this.newPayGroupId == null || this.newPayGroupId.toString() == '')
    {
      this.newPayGroupId  = this.employeeDetails.payGroupId;
    }
    if(this.newEmployeeCategoryId == null || this.newEmployeeCategoryId.toString() == '')
    {
      this.newEmployeeCategoryId  = this.employeeDetails.employeeCategoryId;
    }
    if(this.newDesignationId == null || this.newDesignationId.toString() == '')
    {
      this.newDesignationId  = this.employeeDetails.designationId;
    }
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ALLOWANCE_TYPES+ "?plantId="+this.newPlantId+"&payGroupId="+this.newPayGroupId+"&empCategoryId="+this.newEmployeeCategoryId+"&designationId="+this.newDesignationId+"&isMetro="+this.employeeDetails.isMetroCity)
    .then((data: any) => {
      if (data.length > 0) {
        this.allowanceList = data.sort((a:any, b:any) => { if (a.allowanceType > b.allowanceType) return 1; if (a.allowanceType < b.allowanceType) return -1; return 0; });        
        this.onAllowanceChange();
        this.disableAllowance = false;
      }
      else
        this.disableAllowance = true;
    }).catch((error)=> {
      this.allowanceList = [];
    }); 
  }

  onAllowanceChange(){
    var allowance = this.allowanceList.find((x:any)  => x.id == this.details.allowanceId);
    if(allowance)
      this.allowanceDetails = "HQ:"+allowance.hq + " HS:"+allowance.hs + " IA:"+allowance.ia + " MA:"+allowance.ma + " OS:"+allowance.os + " SA:"+allowance.sa+" EXHQ:"+allowance.exhq;
  }

  saveData() {
    console.log("save data called");
    if(!this.checkZeroOrEmpty()) return;
    
    if (this.checkDuplicates()) {
      swal("Duplicate salary heads not allowed. Please change it.");
      return;
    }
    if (this.benefitsList.length <= 0) {
      swal("There are no Other benefits added, please click Calculate Other benefits.");
      return;
    }
    if (this.employeeDetails.isFieldStaff == true && this.details.allowanceId == null) {
      swal("Allowance is mandatory for field staff.");
      return;
    }
   
    if (this.details.revisedSalaryType == null || this.details.revisedSalaryType == '') {
      swal("Revised Salary type is required.");
      return;
    }

    if (this.details.revisedAmount == null || this.details.revisedAmount == '') {
      swal("Revised amount is required.");
      return;
    }
    let connection: any;
    //this.isLoading = true;
    this.details.employeeId = this.employeeId;
    this.details.isSalaryChange = true;
    this.details.modifiedById = this.currentUser.uid;
    this.details.employeeInitialAppraisalDetailId = this.employeeInitialAppraisalDetailId;
    this.details.headDetails = this.salaryList.concat(this.benefitsList);
    connection = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_SAVE_APPRAISAL_SALARY_DETAILS, this.details);

    swal('Saving...');

    connection.then(
      (data: any) => {
        //this.isLoading = false;       
        if (data == 200 || data.success) {
          swal('Details saved successfully!');
          this.dataSaved.emit(data);
        }
        else
          swal(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        //this.isLoading = false;
        swal('Error occured while saving the details. Error:' + err);
      })
      .catch((error)=> {
        //this.isLoading = false;
        swal('Error occured while saving the details. Error:' + error);
      });
  }

  calculateTotals() {
    this.details.totalIncome = 0;
    this.details.totalDeductions = 0;
    this.details.totalOtherBenefits = 0;
    this.details.totalReimbursements = 0;
    this.details.totalVariable = 0;
    this.details.totalOnetime = 0;
    this.currentMonthlyGross = 0;
    this.details.monthlyGross = 0;

    for (var i = 0; i < this.salaryList.length; i++) {
      var salaryHeadId = this.salaryList[i].salaryHeadId;
      if (salaryHeadId > 0) {
        var head = this.salaryHeads.find((x:any)  => x.id == salaryHeadId);
        if (head) {
          var payableNoOfMonths = this.frequencyValues.find((x:any)  => x.type == head.salaryPayableFrequency).value;
          this.salaryList[i].annualAmount = this.salaryList[i].amount * payableNoOfMonths;
          
          if(head.salaryType == "I" && head.salaryPayableFrequency == 'M')
            this.details.monthlyGross += this.salaryList[i].amount * 1;

          if (head.salaryType == "I") {
            this.details.totalIncome += this.salaryList[i].annualAmount;
            this.currentMonthlyGross += this.salaryList[i].amount;
          }
          else if (head.salaryType == "D")
            this.details.totalDeductions += this.salaryList[i].annualAmount;
          else if (head.salaryType == "R")
            this.details.totalReimbursements += this.salaryList[i].annualAmount;
            else if (head.salaryType == "V")
            this.details.totalVariable += this.salaryList[i].annualAmount;
          else if (head.salaryType == "O")
            this.details.totalOnetime += this.salaryList[i].annualAmount;
        }
      }
    }
    for (var i = 0; i < this.benefitsList.length; i++) {
      var salaryHeadId = this.benefitsList[i].salaryHeadId;
      if (salaryHeadId > 0) {
        var head = this.salaryHeads.find((x:any)  => x.id == salaryHeadId);
        if (head && head.salaryType == "B")
          this.details.totalOtherBenefits += this.benefitsList[i].annualAmount;
      }
    }
    this.details.totalCTC = this.details.totalIncome + this.details.totalReimbursements + this.details.totalOtherBenefits;
  }

  getCTCBreakup() {
    this.isLoading = true;

    let revSalary = this.details.revisedAmount;
    if (this.details.revisedSalaryType == "Monthly") {
      this.getCTCBreakupOnGross();
      return;
    }
    revSalary = (this.details.revisedAmount * 1);
    // if(this.details.oneTimeSalaryType == "Annual" && this.details.oneTimeSalaryAmount != null){
    //   revSalary = (this.details.revisedAmount*1);
    // }
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_CTC_BREAKUP + "/" + this.employeeId + "/" + revSalary+"?catId="+this.newEmployeeCategoryId+"&dsgId="+this.newDesignationId).then((data: any) => {

      //   this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_CTC_BREAKUP + "/" + this.employeeId + "/"+this.details.revisedAmount).then((data: any) => {
      if (data) {
        this.salaryList = data.headDetails;
        var index = 0;
        for (var item of this.salaryList) {
          item.startDate = new Date(this.effectiveDate);
          this.onSalaryHeadChange(index);
          index++;
        }
        this.benefitsList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode == 'B');
        this.salaryList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode != 'B');
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      swal("Error occurred while fetching details.");
    });
  }

  getCTCBreakupOnGross() {
    this.isLoading = true;
    var newGross = (this.details.revisedAmount * 1);
    // if(this.details.oneTimeSalaryType == "Monthly" && this.details.oneTimeSalaryAmount != null){
    //    newGross = (this.details.revisedAmount*1) + (this.currentMonthlyGross*1) + (this.details.oneTimeSalaryAmount*1) ;

    // }

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_CTC_BREAKUP_ON_GROSS + "/" + this.employeeId + "/" + newGross+"?catId="+this.newEmployeeCategoryId+"&dsgId="+this.newDesignationId).then((data: any) => {
      if (data) {
        this.salaryList = data.headDetails;
        var index = 0;
        for (var item of this.salaryList) {
          item.startDate = new Date(this.effectiveDate);
          this.onSalaryHeadChange(index);
          index++;
        }
        this.benefitsList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode == 'B');
        this.salaryList = this.salaryList.filter((x:any)  => x.salaryTypeShortCode != 'B');
        this.calculateTotals();
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      swal("Error occurred while fetching details.");
    });
  }

  getOtherBenefits() {
    if (this.salaryList.length == 0) {
      swal("Please add income details.");
      return;
    }
    this.isLoading = true;

    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_OTHER_BENEFITS + "/" + this.employeeId, this.salaryList).then((data: any) => {
      if (data) {
        this.benefitsList = data;
        var index = 0;
        for (var item of this.benefitsList) {
          var lineItem = this.benefitsList[index];
          var head = this.salaryHeads.find((x:any)  => x.id == lineItem.salaryHeadId);
          if (head) {
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
      swal("Error occurred while gettting details.");
      this.details = {};
    });
  }

  showDetails(type, title) {
    debugger;
    this.salaryDetailsHead = title;
    if (type == "All") {
      this.salaryDetails = this.salaryList;
    }
    else if (type == "B") {
      this.salaryDetails = this.benefitsList;
    }
    else {
      this.salaryDetails = this.salaryList.filter((x:any)  => x.salaryTypeShortCode == type);
    }
    $("#salaryDetailsModal").modal("show");
  }

  headTypes = [{ type: "I", value: "Income" }, { type: "D", value: "Deduction" }, { type: "R", value: "Reimbursement" }, {type:"V", value:"Variable Pay"}, {type:"O", value:"One Time"}, { type: "B", value: "Other Benefit" }];
  frequency = [{ type: "M", value: "Monthly" }, { type: "Q", value: "Quarterly" }, { type: "H", value: "Half-Yearly" }, { type: "A", value: "Annually" }, { type: "D", value: "Daily" }, { type: "O", value: "One Time" }];
  frequencyValues = [{ type: "M", value: 12 }, { type: "Q", value: 4 }, { type: "H", value: 2 }, { type: "A", value: 1 }, { type: "O", value: 1 }];

  onSalaryHeadChange(index) {
    if (index >= 0) {
      var lineItem = this.salaryList[index];
      var head = this.salaryHeads.find((x:any)  => x.id == lineItem.salaryHeadId);
      if (head) {
        this.salaryList[index].description = head.descriptionInPaySlip;
        this.salaryList[index].salaryType = this.headTypes.find((x:any)  => x.type == head.salaryType).value;
        this.salaryList[index].salaryTypeShortCode = head.salaryType;
        this.salaryList[index].frequency = this.frequency.find((x:any)  => x.type == head.salaryPayableFrequency).value;
      }
    }
  }

  checkDuplicates() {
    var foundDuplicate = false;
    for (var i = 0; i < this.salaryList.length; i++) {
      if (this.salaryList.findIndex((x:any)  => x.salaryHeadId == this.salaryList[i].salaryHeadId) != i) {
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
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_SALARY_HEADS).then((data: any) => {
      if (data) {
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

  onAddLineClick() {
    this.salaryList.push({});
    this.count++;
  }

  RemoveLine(no) {
    var salaryHeadId = this.salaryList[no].salaryHeadId;
    // clear out the payable values
    this.salaryList.splice(no, 1);
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
