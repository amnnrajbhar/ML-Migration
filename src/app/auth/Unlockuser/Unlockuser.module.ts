import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnlockuserComponent } from './Unlockuser.component';
import { UnlockuserRoutingModule } from './Unlockuser-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        UnlockuserRoutingModule
    ],
    declarations: [
        UnlockuserComponent
    ]
})
export class UnlockuserModule { }
