import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantHeadcomponent } from './PlantHead.component';
import { PlantHeadRoutingModule } from './PlantHead-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        PlantHeadRoutingModule,
        HttpClientModule, RouterModule,

    ],
    declarations: [
        PlantHeadcomponent,
    ]
})
export class PlantHeadModule { }