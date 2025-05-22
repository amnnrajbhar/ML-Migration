import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var toastr: any;

@Component({
  selector: 'app-appointment-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.css']
})
export class FamilyComponent implements OnInit {
@ViewChild(NgForm, { static: false }) familyForm: NgForm;

  @Input() appointmentId: number;
  @Input() offerId: number;
  @Input() guid: string;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

  isLoading = false;
  familyList: any[] = [];
  relationshipTypes: any[] = [];
  count: number = 0;
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }, { type: "Late." }];

  item: any = {isEmployee:"No"};
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedRelationshipType: any = null;
  personalDetails: any = {};

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.service.getRelationTypes().then((data:any)=>{this.relationshipTypes = data;});
    this.LoadData();
    this.getPersonalData();
  }

  LoadData() {
    this.isLoading = true;
    let conn: any;
    if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_FAMILY_DETAILS + "/" + this.appointmentId);
    else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_FAMILY_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data && data.length > 0) {
        this.familyList = data;
        this.count = data.length;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.familyList = [];
    });
  }

  
  saveData(){
    let connection: any;
    //this.isLoading = true;
    let data: any = {};
    data.appointmentId = this.appointmentId;
    data.offerId = this.offerId;
    data.offerGuid = this.guid;
    data.list = this.familyList;

    if(!this.isValid())
      return;

    for(var d of data.list){
      if(d.birthDate != "")
        d.birthDate = this.util.getFormatedDateTime(d.birthDate);        
    }
    if(this.appointmentId > 0)
      connection = this.httpService.HRpost(APIURLS.APPOINTMENT_SAVE_FAMILY_DETAILS, data);
    else
      connection = this.service.postData(APIURLS.CANDIDATE_SAVE_FAMILY_DETAILS, data);
    
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
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving address details. Error:' + error);
      });
  }

  getPersonalData(){
    let conn: any;
    if(this.appointmentId > 0)
      conn = this.httpService.HRget(APIURLS.APPOINTMENT_GET_PERSONAL_DETAILS + "/" + this.appointmentId);
    else
      conn = this.service.getData(APIURLS.CANDIDATE_GET_PERSONAL_DETAILS + "/" + this.offerId + "/" + this.guid);

    conn.then((data: any) => {
      if (data) {
        this.personalDetails = data;      
      }
    }).catch(error => {
      
      toastr.error("Error occurred while fetching details, please check the link.");
      this.personalDetails = {};
    });
  }

  isValid(){
    var valid = true;
    var mandatoryTypes = [{type:"father"}, {type: "mother"}];
    for(var type of mandatoryTypes){
      if(!this.familyList.some(x=>x.relationshipType.toLowerCase() == type.type)){
        toastr.error("Please add "+type.type+" details.");
        valid = false;
      }
    }    
    
    if(valid && this.personalDetails.maritalStatusId == 2) // married
    {
      if(!this.familyList.some(x=>x.relationshipType.toLowerCase() == "spouse")){
        toastr.error("Please add Spouse details.");
        valid = false;
      }
    }
    return valid;
  }

  onRelationshipChange(){
    if(this.selectedRelationshipType){
      this.item.gender = this.selectedRelationshipType.gender; 
      if(this.selectedRelationshipType.relationship.toLowerCase() == "spouse")
      {
        this.item.gender = this.personalDetails.gender.toLowerCase() =="male"?"Female":"Male" ; 
      }
    }
  }

  onAddLineClick(){    
    this.item.relationshipType = this.selectedRelationshipType.relationship;
    this.item.relationshipTypeId = this.selectedRelationshipType.id;    
    var today = new Date();
    if(this.item.birthDate != "" && this.item.birthDate >= today  ){
      toastr.error("Birth date should be before today date.");
        return;
    }
    this.familyList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedRelationshipType = this.relationshipTypes.find(x=>x.id==item.relationshipTypeId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateClick(){
    this.item.relationshipType = this.selectedRelationshipType.relationship;
    this.item.relationshipTypeId = this.selectedRelationshipType.id;    
    var today = new Date();
    if(this.item.birthDate != "" && this.item.birthDate >= today  ){
      toastr.error("Birth date should be before today date.");
        return;
    }
    this.familyList[this.editIndex] = this.item;
    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.familyList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {isEmployee:"No"};
    this.editIndex = -1;    
    this.selectedRelationshipType = null;
    this.familyForm.form.markAsPristine();
    this.familyForm.form.markAsUntouched();
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
