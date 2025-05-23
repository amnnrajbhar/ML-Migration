import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
//import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { Employee } from '../masters/employee/employee.model';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;

// import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.css']
})
export class TestpageComponent implements OnInit {
  myForm = new FormGroup({}) // Instantiating our form
  control = new FormControl();
  streets: string[] = ['Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue'];
  filteredStreets: Observable<string[]>;
  isLoading: boolean;
  depList: any;
  tableWidget: any;
  
  constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient,
  
    private router: Router,private fb: FormBuilder){ // Injecting the ReactiveForms FormBuilder.
    this.myForm = fb.group({
      // Adding the "myNum" input to our FormGroup along with its min-max Validators.
      'myNum': ['', [Validators.min(5), Validators.max(10)]] 
    }) 
  }
  // constructor(private atp: AmazingTimePickerService){}
  getEmpList(){
    // debugger;
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      if (data.length > 0) {
        this.empMList = data;
        this.empMList.forEach(element=>{
          var t = {'id':0,'name':''};
          t.id = element.id;
          let lastName = this.isEmpty(element.lastName.trim())?'-':'-'+element.lastName+'-';
          t.name = element.firstName+lastName+element.employeeId+'-'+element.designation;
          // this.empMListCon.push(t);
          this.empMListCon = [...this.empMListCon, t];

        })
        // this.empListCon1 = this.empListCon;
        console.log(this.empMListCon);
        this.dropdownSettings1 = {
          singleSelection: true,
          idField: 'id',
          textField: 'name',
          allowSearchFilter: true
        };
      }
    }).catch(error => {
      this.isLoading = false;
      this.empMList = [];
    });
  }
  isEmpty(str){
    if(str.length==0) return true;
    else return false;
  }
  onItemSelect1(item: any) {
    // console.log(item);
    // this.selParentRole.push(item);
  }
  onSelectAll(items: any) {
    // console.log(items);
  }
  selParentRole=[];
  dropdownSettings1={};
  empMList:any=[];
  empMListCon=[];
  ngOnInit() {
    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
      this.getDepartList();
      this.getEmpList();

  }
  getDepartList() {
     
    this.httpService.getPaged(APIURLS.BR_MASTER_DEPARTMENT_PAGED_API,1,20).then((data: any) => {
      this.isLoading = false;
      if (data.length >0) {
        this.depList = data;
        
        // this.depList.forEach(element => {
        //   element.parentName = '';
        //   element.parentName = this.depList.find(x => x.id == element.fkParentId)['name'];
        // });

        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.depList = [];
    });
  }
  private initDatatable(): void {
    let exampleId: any = jQuery('#department');
      this.tableWidget = exampleId.DataTable();
  }

  private reInitDatatable(): void {
      if (this.tableWidget) {
          this.tableWidget.destroy()
          this.tableWidget = null
      }
      setTimeout(() => this.initDatatable(), 0)
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.streets.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

}
