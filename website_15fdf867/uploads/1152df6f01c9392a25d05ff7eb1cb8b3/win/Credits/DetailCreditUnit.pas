
unit DetailCreditUnit;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants,
  System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, Vcl.ExtCtrls,
  FireDAC.VCLUI.Controls , Vcl.ComCtrls , Vcl.ExtDlgs ,cxButtons  ;
type
  TFrmDetailCredit = class(TForm)
    Timer1: TTimer;    
	LbWinTitle: TLabel;
	SBPlatForm: TScrollBox;
    BtnSave: TcxButton;
    BtnCancel: TcxButton;	
     PaClient_id: TPanel;  
 LbClient: TLabel; 
 BtnClient: TcxButton; 
 CoClient: TCombobox; 

 PaPrice: TPanel;  
 EdPrice: TEdit; 


        
	 procedure BtnClientClick(Sender: TObject);

    procedure Timer1Timer(Sender: TObject);
    procedure BtnSaveClick(Sender: TObject);
    procedure BtnCancelClick(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
	procedure SBPlatFormMouseWheel(Sender: TObject; Shift: TShiftState;
              WheelDelta: Integer; MousePos: TPoint; var Handled: Boolean);
  private
     procedure LoadClients ; 

    function IsDataCurrect: Boolean;
    procedure LoadCredit;
    function SaveCredit: Boolean;
  public
  Var
    ID: string;
  end;

var
  FrmDetailCredit: TFrmDetailCredit;

implementation

{$R *.dfm}
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses DmUnit, ControllerCredit   , ControllerClient , ClientsUnit    ;
procedure TFrmDetailCredit.SBPlatFormMouseWheel(Sender: TObject; Shift: TShiftState;
  WheelDelta: Integer; MousePos: TPoint; var Handled: Boolean);
begin
  if WheelDelta > 0 then
    TScrollBox(Sender).VertScrollBar.Position := TScrollBox(Sender)
      .VertScrollBar.Position - 10
  else
    TScrollBox(Sender).VertScrollBar.Position := TScrollBox(Sender)
      .VertScrollBar.Position + 10;
  Handled := true;
end;

procedure TFrmDetailCredit.BtnSaveClick(Sender: TObject);
begin
  if SaveCredit then
    ModalResult := mrOk;
end;

procedure TFrmDetailCredit.BtnCancelClick(Sender: TObject);
begin
  ModalResult := mrCancel;
end;
procedure TFrmDetailCredit.FormDestroy(Sender: TObject);
begin
  // free
 DM.FreeObjectCB(CoClient.items) ; 

end;
procedure TFrmDetailCredit.FormShow(Sender: TObject);
begin
   LoadClients ; 

  LoadCredit;
end;

function TFrmDetailCredit.IsDataCurrect: Boolean;
begin
//  Result := False;
//  if DM.GS.IsNotEmpty(EdName.Text) then
    Result := True;
end;

procedure TFrmDetailCredit.LoadCredit;
begin
  with TCredit.Create(ID) do
    try
        With TClient.Create(Client_id) do 
 try  
 CoClient.ItemIndex := CoClient.items.IndexOf(ID); 
 finally  
free; 
 end; 
Client_id:= TClient(CoClient .items.Objects[CoClient.ItemIndex]).id;
 EdPrice.Text := (Price).tostring ; 
Price := StrtoFloat(EdPrice.Text) ; 

    finally
      Free;
    end;
end;

function TFrmDetailCredit.SaveCredit: Boolean;
begin
  with TCredit.Create(ID) do
    try
      
      Result := Save;
    finally
      Free;
    end;
end;

procedure TFrmDetailCredit.Timer1Timer(Sender: TObject);
begin
  BtnSave.Enabled := IsDataCurrect;
end;




procedure TFrmDetailCredit.BtnClientClick(Sender: TObject);
begin
  with TFrmClients.Create(Self) do
    try
        ShowModal;
        LoadClients;
    finally
      Free;
    end;
end;



procedure TFrmDetailCredit.LoadClients;
var
  Str: TStrings;
begin

  Str := TClient.Clients;
  try
    DM.FreeObjectCB(CoClient.items);
    CoClient.items.Assign(Str);
  finally
    Str.Free;
  end;

end;



end.
