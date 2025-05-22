import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import swal from 'sweetalert';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { RoomInformation } from '../room-maintenance/room.model';
import { RoomFacility } from '../roomfacilities-master/roomfacility.model';
import { Facilities } from '../room-maintenance/facility.model';
import { RoomType } from '../roomtype-master/roomtype.model';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-book-room',
  templateUrl: './book-room.component.html',
  styleUrls: ['./book-room.component.css']
})
export class BookRoomComponent implements OnInit {
  currentUser: AuthData;
  isLoading: boolean;
  urlPath: string = '';
  locationList = [];
  roomInformation = {} as RoomInformation;
  roomsInfoList: RoomInformation[] = [];
  roomId:number;
  baseLocation:number;
  roomType:number;
  roomsTypeList: RoomType[] = [];
  type:string="RoomBooking";
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute, private _lightbox: Lightbox) { }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.paramMap.subscribe((params:ParamMap)=>{
      this.roomId=params.get('id')?parseInt(params.get('id')):0;
      if(this.roomId==0)
          this.baseLocation=this.currentUser.baselocation;
      else
          this.baseLocation=parseInt(params.get('lid'));
    });
    this.getLocationList();
    this.getRoomsByLocation(this.baseLocation);
    this.getRoomfacilities();
    this.getAllroomsTypes();
  }
  getLocationList() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x=>x.isActive);
        let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        this.locationList.sort((a,b)=>{return collator.compare(a.code,b.code)});
        this.isLoading = false;
      }
    }).catch(error => {
      this.locationList = [];
    });
  }
  getAllroomsTypes() {
    this.httpService.get(APIURLS.BR_MASTER_ROOMTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsTypeList = data.sort((a,b)=>
                                  {
                                    if(a.type > b.type) return 1;
                                    if(a.type < b.type) return -1;
                                    return 0;
                                  });
        this.roomType=null;
      }
    }).catch(error => {
      this.roomsTypeList = [];
    });
  }
  onSelect(locId) {
    this.roomsInfoList = [];
    this.baseLocation=locId;
    this.getRoomsByLocation(locId);
  }
  onSelectType(rmType) {
    this.roomsInfoList = [];
    this.roomType=rmType;
    this.getRoomsByLocation(this.baseLocation);
    this.roomsInfoList= this.roomsInfoList.filter(x=>x.fk_Type==rmType);
  }
  getRoomsByLocation(lId: number) {
   let roomInfo:any;
   this.isLoading = true;
    this.httpService.getById(APIURLS.BR_ROOM_MASTER_GetBYANY_API, lId).then((data: any) => {
      if (data) {
        if (this.roomType != null)
          this.roomsInfoList = data.filter(x => x.fk_Type == this.roomType && x.isActive);
        else
          this.roomsInfoList = data.filter(x => x.isActive);
        if (this.roomId == 0)
          roomInfo = this.roomsInfoList[0];
        else
          roomInfo = this.roomsInfoList.find(x=>x.id==this.roomId);
        this.showRoomDetails(roomInfo);
      }
      this.isLoading = false;
    }).catch(error => {
      this.roomsInfoList = [];
      this.isLoading = false;
    });
  }

  onSelectRoom(item: any) {
    //console.log(item);
    this.showRoomDetails(item);
  }
  showRoomDetails(item: any) {
    this.images = [];
    this.roomInformation = item;
    this.getSelectedRoomTypeById(item.fk_Type);
    this.getSelectedfacilitiesById(item.id);
    this.getSelectedPicturesById(item.id);
  }
  //Get Selected RoomType:
  selectedRoomType = {} as RoomType;
  getSelectedRoomTypeById(rtyid: number): void {
    this.httpService.getById(APIURLS.BR_MASTER_ROOMTYPE_API, rtyid).then((data: any) => {
      if (data) {
        this.selectedRoomType = data;
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  //Get Selected Roomfacilities:
  getSelectedfacilitiesById(rid: number): void {
    let selectedFacilities: Facilities[] = [];
    let rmFacilities = [];
    this.httpService.getById(APIURLS.BR_ROOM_FACILITIES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        selectedFacilities = data;
        for (let index = 0; index < selectedFacilities.length; index++) {
          let element = selectedFacilities[index];
          let facility = this.roomsFacilityList.find(x => x.id == element.fk_FacilityId);
          rmFacilities.push(facility);
        }
        this.selectedItems = rmFacilities;
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  roomsFacilityList: RoomFacility[] = [];
  selectedItems: RoomFacility[] = [];
  getRoomfacilities() {
    this.httpService.get(APIURLS.BR_MASTER_ROOM_FACILITY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsFacilityList = data.filter(x => x.type == this.type);
      }
    }).catch(error => {
      this.roomsFacilityList = [];
    });
  }

  //Get Selected RoomPictures:
  images: any = [];
  getSelectedPicturesById(rid: number): void {
    this.httpService.getById(APIURLS.BR_ROOM_PICTURES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        let selectedPictures = data;
        for (let i = 0; i < selectedPictures.length; i++) {
          let item = selectedPictures[i];
          const image = {
            id: 0,
            name: '',
            src: '',
            url: ''
          };
          image.id = item.id;
          image.name = item.fileName;
          image.src = item.path;
          image.url = item.path;
          this.images.push(image);
        }
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  open(index: number): void {
    this._lightbox.open(this.images, index);
  }

  close(): void {
    this._lightbox.close();
  }
  onBookEvent() {
    // this.router.navigate([this.roomInformation.id], { relativeTo: this.route });
    this.router.navigate(['/book-room',this.roomInformation.id]);
  }
  isActiveTab(idx: number,selectedRoom:any) {
    if(this.roomId!=0)
      return this.roomId===selectedRoom.id;
    return idx === 0;
  }
}
