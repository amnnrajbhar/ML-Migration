import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
// import { User } from '../user/user.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { SBU } from './sbu.model';
// import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';
import { Employee } from '../employee/employee.model';
import { FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Location } from '../employee/location.model';
import { isUndefined } from 'util';
declare var jQuery: any;
// import { Subject, Observable } from 'rxjs';


@Component({
  selector: 'app-sbu',
  templateUrl: './sbu.component.html',
  styleUrls: ['./sbu.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class SbuComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
 @ViewChild(NgForm, { static: false }) sbuForm!: NgForm;
  searchTerm: FormControl = new FormControl();
  // private trigger: Subject<void> = new Subject<void>();
    public tableWidget: any;
    indexI: number = 0;
    sbuList!: any[];
    empMList: any[]=[[]];
    empMListCon: any=[];
    empMListCon1: any=[];
    parentList!: any[];
    // employeeList!: any[];
    selParentRole: any;
    selHeadEmpId: any=[];
    sbuItem: SBU = new SBU(0, '','', '', 0, 0,'',true);
    empItem: Employee =  new  Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    checkAll: boolean = false;
    // myControl: FormControl = new FormControl();
    path:string = '';
    public filteredItems = [];
    notFirst: boolean = true;
    public employeeList: any[]=[[]];
  locationList: Location[]=[];
    constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient, private router: Router) { }

    clearForm(){
      // console.log('form reset');
      this.sbuForm.resetForm();
      // this.sbuForm.reset();
      this.getSBUList();
    }
    private initDatatable(): void {
      let exampleId: any = jQuery('#sbu');
        this.tableWidget = exampleId.DataTable({
          "order": []
        });
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0);
    }
    // public get triggerObservable(): Observable<void> {
    //   return this.trigger.asObservable();
    // }
  //   setUpManagerFilter()  {
  //   this.searchTerm.valueChanges.subscribe(
  //       term => {
  //         if (term != '') {
  // console.log(term.toString().toLowerCase());
  //           var arr = [];
  //           this.employeeList.forEach(elt => {
  //               if(elt.firstName.toString().toLowerCase().includes(term.toString().toLowerCase())||elt.employeeId.toString().toLowerCase().includes(term.toString().toLowerCase())
  //               ||elt.baseLocation.toString().toLowerCase().includes(term.toString().toLowerCase())||elt.designation.toString().toLowerCase().includes(term.toString().toLowerCase()))
  //             {
                
  //               arr.push(elt);
  //             }
  //           });
  //           this.filteredItems = arr;
  //         }
  //         else{
  //           this.filteredItems = this.employeeList;
  //         }
  //     })
  // }

//   onPersonSelectionChanged(event) {
//     const selectedValue = event.option.value.id;
//     this.selHeadEmpId = this.empMList.find(s=>s.id==selectedValue);
// console.log(selectedValue);
// const selectedName = event.option.value;
// console.log(selectedName);
// }

checkStatus(){
  // console.log(this.selHeadEmpId.length+'<->'+this.notFirst);
  if(this.selHeadEmpId.length<=0) this.notFirst=false;
}

getLocationMaster(){
  this.isLoading = true;
  this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
    // this.isLoading = false;
    if (data.length > 0) {
      this.locationList = data;
      // console.log(this.empMList);
      // this.employeeList = data;
      // console.log(this.locationList);      
    }
  }).catch((error)=> {
    // this.isLoading = false;
    this.locationList = [];
  });
}

getLocationName(id){
  let t =  this.locationList.find(s=>s.id == id);
  return t?t.code+' - '+t.name:'';
}
displayFn(user: Employee): string {
  let baseLocation = user? this.getLocationName(user.baseLocation): '';
  return user ? user.firstName+' - '+user.employeeId + ' - ' + user.designation + ' - ' + baseLocation : '';
}

onItemSelect(item: any) {
  // this.selCompetencyHead  = item;
  // console.log(item);
  // console.log(this.selHeadEmpId );
}
    ngOnInit() {
      this.path = this.router.url;
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      if(chkaccess == true){
        ////// console.log(chkaccess);
        
        this.getLocationMaster();
        this.getSBUList();
      this.getEmpList();
      this.isLoading = false;
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    
    ngAfterViewInit() {
        this.initDatatable();
    }

    
    onAddSbu(isEdit: boolean, data: SBU) {
      // debugger;
      // this.clearForm();
    this.sbuForm.form.markAsPristine();
    this.sbuForm.form.markAsUntouched();
    this.sbuForm.form.updateValueAndValidity();

      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = true;
      this.empMListCon1 = this.empMListCon;
      this.notFirst = true;
      // debugger;
      if (this.isEdit) {
        this.sbuItem = data;
        this.parentList = this.sbuList.filter((s:any) => s.isActive != false);
        // this.employeeList = this.empMList.filter((s:any) => s.isActive != false);

        this.selParentRole = this.sbuList.find((s:any) => s.id === this.sbuItem.fkParentId);
        ////// console.log(this.sbuItem.headEmpId);
        // this.selHeadEmpId = this.empMList.find((s:any) => s.id === this.sbuItem.headEmpId);
        this.selHeadEmpId = this.empMListCon1.filter((s:any) => s.id === this.sbuItem.headEmpId);
        let selectedPerson = this.empMList.find(s=>s.id==this.sbuItem.headEmpId);
        this.searchTerm.setValue(selectedPerson);
      }
      else {
        this.searchTerm.setValue('');
        this.parentList = this.sbuList.filter((s:any) => s.isActive != false);;
        this.sbuItem = new SBU(0, '','', '', 0, 0, '', true);
        this.empItem = new  Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
        this.selParentRole = null;
        this.selHeadEmpId = [];
      }
      this.isLoadingPop = false;
      jQuery("#myModal").modal('show');
    }
  getHeader(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

    getHeadSBUName(id: number){
      let temp: any;
      temp = this.empMList.find((s:any) => s.id == id);
      var name = (typeof temp != 'undefined')? temp.firstName + ' ' + temp.lastName: '';
      return name;
    }
    selectedItems = [];
    dropdownSettings  = {};

    
  isEmpty(str){
    if(str.length==0) return true;
    else return false;
  }
    getEmpList(){
      this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
        // this.isLoading = false;
        if (data.length > 0) {
          this.empMList = data;
          this.employeeList = data;

          this.empMList.forEach(element=>{
            var t = {'id':0,'name':''};
            t.id = element.id;
            let lastName = this.isEmpty(element.lastName.trim())?'-':'-'+element.lastName+'-';
            t.name = element.firstName+lastName+element.employeeId+'-'+element.designation;
            this.empMListCon.push(t);
          })
          // this.empListCon1 = this.empListCon;
          // console.log(this.empListCon);
          this.dropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: true
          };
        }
      }).catch((error)=> {
        // this.isLoading = false;
        this.empMList = [];
        this.employeeList = [];
      });
    }

    getSBUList() {
      this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
        // this.isLoading = false;
        if (data.length > 0) {
          this.sbuList = data;
        }
        this.reInitDatatable();
      }).catch((error)=> {
        // this.isLoading = false;
        this.sbuList = [];
      });
    }

    validatedForm: boolean = true;

// validateForm(){
// debugger;
//   this.errMsgPop = '';
//   this.validatedForm = true;
//   let validName = this.sbuList.some((s:any) => s.name == this.sbuItem.name && s.id != this.sbuItem.id);
//   let validCode = this.sbuList.some((s:any) => s.code == this.sbuItem.code && s.id != this.sbuItem.id);
//   if(validName){
//     this.isLoadingPop = false;
//     this.validatedForm = false;
//       this.errMsgPop = 'SBU name already exists..';
//      return;
//   }

//   if(validCode){
//     this.isLoadingPop = false;
//     this.validatedForm = false;
//       this.errMsgPop = 'SBU code entered already exists..';
//       return;
//   }
//   this.getSBUList();
// }

closeSaveModal() {
  ////// console.log('testpop')
  jQuery("#saveModal").modal('hide');
  
  // window.location.reload();
}
    onSaveSbu() {
      debugger;
      this.errMsg = '';
      this.errMsgPop = '';
      this.isLoadingPop = true;
      this.sbuItem.fkParentId = this.selParentRole.id;
      
      // this.sbuItem.headEmpId = this.selHeadEmpId.id;
      // console.log(this.selHeadEmpId);
      this.sbuItem.headEmpId = this.selHeadEmpId[0].id;
      let connection: any;
      this.validatedForm = true;
  let validName = this.sbuList.some((s:any) => s.name.trim().toLowerCase() == this.sbuItem.name.toLowerCase() && s.id != this.sbuItem.id);
  let validCode = this.sbuList.some((s:any) => s.code.trim().toLowerCase() == this.sbuItem.code.toLowerCase() && s.id != this.sbuItem.id);
  let blankName = (this.sbuItem.name.trim()=='' || this.sbuItem.name.trim()==null)
  let blankCode = (this.sbuItem.code.trim()=='' || this.sbuItem.code.trim()==null)
  if(validName){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'SBU name already exists..';
      // this.getSBUList();
  }

  else if(validCode){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'SBU code entered already exists..';
      // this.getSBUList();
  }
  else if(blankName){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'SBU name cannot be blank';
      // this.getSBUList();
  }
  else if(blankCode){
    this.isLoadingPop = false;
    this.validatedForm = false;
      this.errMsgPop = 'SBU code cannot be blank';
      // this.getSBUList();
  }
     else{
      // Object.values(this.sbuItem).map(element => {
      // console.log(element+':'+typeof element);
      //   element = (element!=null && typeof element == 'string')? element.trim():element;
      //   if(typeof element == 'string') // console.log(':'+element.trim()+':');
      // });
      // console.log(this.sbuItem);
        if (!this.isEdit) {
          connection = this.httpService.post(APIURLS.BR_MASTER_SBU, this.sbuItem);
        }
        else {
          connection = this.httpService.put(APIURLS.BR_MASTER_SBU, this.sbuItem.id, this.sbuItem);
        }
        connection.then((data: any) => {
        this.isLoadingPop = false;
        ////// console.log(data);
        if (data == 200 || data.id>0) {
          ////// console.log(data);
          jQuery('#myModal').modal('hide');
          this.errMsgPop1 = ' SBU data saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getSBUList();
        }
        }).catch((error)=> {
         this.isLoadingPop = false;
         this.errMsgPop = 'Error saving sbu data..';
        });
      }
      // else{
      //   this.isLoadingPop = false;
      //   this.errMsgPop = 'Sbu already exists..';
      // }
    }
}
