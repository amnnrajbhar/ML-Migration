import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../../shared/app.service';
import { HttpService } from '../../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../../shared/api-url';
import { AppointmentService } from '../../../Services/appointmentService.service';
import { Util } from '../../../Services/util.service';
import swal from 'sweetalert';
declare var require: any;

@Component({
  selector: 'app-profile-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  @Input() employeeId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  isLoading = false;
  details:any={};
  monthlyComponents: any[] = [];
  monthlyTotal = 0;
  monthlyAnnualTotal = 0;
  annualComponents: any[] = [];
  variableComponents: any[] = [];
  onetimeComponents: any[] = [];
  totalCTC=0;
  variableTotal =0;
  onetimeTotal = 0;

  headTypes = [{type:"I", value:"Income"}, {type:"D", value:"Deduction"}, {type:"R", value:"Reimbursement"}, {type:"O", value:"One Time"}, {type:"V", value:"Variable Pay"}, {type:"B", value:"Other Benefit"}];
  frequency = [{type:"M", value:"Monthly"}, {type:"Q", value:"Quarterly"}, {type:"H", value:"Half-Yearly"}, {type:"A", value:"Annually"}, {type:"D", value:"Daily"}, {type:"O", value:"One Time"}];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    
    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_SALARY_DETAILS + "/" + this.employeeId ).then((data: any) => {
      if (data) {
        this.details = data;
        this.dataLoaded.emit("loaded");
        if(this.details.headDetails && this.details.headDetails.length > 0){
          for(var item of this.details.headDetails){            
            item.salaryTypeName = this.headTypes.find(x => x.type == item.salaryType).value;
            item.frequencyName = this.frequency.find(x => x.type == item.frequency).value;
          }
          this.monthlyComponents = this.details.headDetails.filter(x=>x.salaryType=="I" && x.frequency == "M");
          this.annualComponents = this.details.headDetails.filter(x=>x.salaryType!="V" && x.frequency == "A");
          this.variableComponents = this.details.headDetails.filter(x=>x.salaryType =="V");
          this.onetimeComponents = this.details.headDetails.filter(x=>x.salaryType =="O" && x.frequency == "O");
          this.calculateTotals();
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      swal("Error occurred while fetching details, please check the link.");
    });
  }

  
  calculateTotals(){
    this.details.totalIncome = 0;
    this.details.totalDeductions = 0;
    this.details.totalOtherBenefits = 0;
    this.details.totalReimbursements = 0;
    
    for(var i=0; i < this.details.headDetails.length; i++){
      var head = this.details.headDetails[i];          
          if(head.salaryType == "I"){          
            this.details.totalIncome += head.annualAmount;
            this.totalCTC += head.annualAmount;
            if(head.frequency == "M"){
              this.monthlyTotal += head.amount;
              this.monthlyAnnualTotal += head.annualAmount;
            }
          }
          else if(head.salaryType == "D")
            this.details.totalDeductions += head.annualAmount;        
          else if(head.salaryType == "R"){
            this.details.totalReimbursements += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
           else if(head.salaryType == "B"){
            this.details.totalOtherBenefits += head.annualAmount;
            this.totalCTC += head.annualAmount;
          }
          else if(head.salaryType == "V"){
            this.variableTotal += head.annualAmount;
          }
          else if(head.salaryType == "O"){
            this.onetimeTotal += head.annualAmount;
          }
    }    
    this.details.totalCTC = this.details.totalIncome + this.details.totalReimbursements + this.details.totalOtherBenefits;
  }

}
