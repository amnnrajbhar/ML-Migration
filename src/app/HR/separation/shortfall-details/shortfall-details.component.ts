import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-resignation-shortfall-details',
  templateUrl: './shortfall-details.component.html',
  styleUrls: ['./shortfall-details.component.css']
})
export class ShortfallDetailsComponent implements OnInit, OnChanges {
  @Input() resignationDetails: any;
  
  isShortfall = false;

  constructor() { }

  ngOnInit() {
    if (this.resignationDetails.shortfallDays < 0)
    {
      this.isShortfall=true;
    }    
  }

  ngOnChanges(){
    if (this.resignationDetails.shortfallDays < 0)
    {
      this.isShortfall=true;
    }  
  }

}
