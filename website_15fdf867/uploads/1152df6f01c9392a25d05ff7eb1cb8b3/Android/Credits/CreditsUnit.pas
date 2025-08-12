
	unit CreditsUnit;

interface

uses
  System.SysUtils, System.Types, System.UITypes, System.Classes,
  System.Variants,
  FMX.Types, FMX.Controls, FMX.Forms, FMX.Graphics, FMX.Dialogs, FMX.Layouts,
  FMX.ListBox, FMX.Controls.Presentation, FMX.StdCtrls, FireDAC.Stan.Intf,
  FireDAC.Stan.Option, FireDAC.Stan.Param, FireDAC.Stan.Error, FireDAC.DatS,
  FireDAC.Phys.Intf, FireDAC.DApt.Intf, Data.DB, FireDAC.Comp.DataSet,
  FireDAC.Comp.Client, ItemCreditUnit, FMX.Objects, FMX.TabControl, FMX.Edit,
  FMX.DateTimeCtrls;

type
  TFrmCredits = class(TForm)
    ListBox1: TListBox;
    RoundRect1: TRoundRect;
    Credits: TFDMemTable;
    CreditsID:TStringField ; 
CreditsPrice:TFloatField ; 


    TabControl1: TTabControl;
    TabItem1: TTabItem;
    TabItem2: TTabItem;
    RectSave: TRectangle;
    LbSave: TLabel;
    Timer1: TTimer;
    VertScrollBox1: TVertScrollBox;
    BtnReturn: TButton;

    RecPrice : TRectangle; 

    EdPrice:TEdit ; 


    procedure RoundRect1Click(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure RecReturnClick(Sender: TObject);
    procedure RectSaveClick(Sender: TObject);
    procedure LbSaveClick(Sender: TObject);
    procedure BtnReturnClick(Sender: TObject);
  private
    procedure NewCredit;
    procedure CreateItems(aDataSet: TDataSet; aListBox: TListBox);
    procedure SaveCredit;
    function IsDataCorrect: Boolean;
  public
    procedure ShowDetailCredit(aID: string);
    procedure LoadCredit(aID: string);
    procedure LoadCredits;

  var
    ID: string;
    aColor_Item: TAlphaColor;

  const
    Height_Item = 35;
  end;

var
  FrmCredits: TFrmCredits;

implementation

{$R *.fmx} 
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}
uses FrameListBoxItem, DMUnit, Consts, ControllerCredit, System.UIConsts;


procedure TFrmCredits.BtnReturnClick(Sender: TObject);
begin
  TabControl1.TabIndex := 0;
end;

procedure TFrmCredits.CreateItems(aDataSet: TDataSet; aListBox: TListBox);
begin
  aListBox.Clear;
  aDataSet.ControlsDisabled;
  while not aDataSet.Eof do
  begin
    with TFrameListBoxItem<TItemCredit>.Create(aListBox) do
    begin
      Parent := aListBox;
      Height := Height_Item;
      Frame.ID := aDataSet.FieldByName('ID').AsString;
Frame.LbPrice.text := aDataSet.FieldByName('Price').AsString;

      Frame.LoadData := LoadCredits;
      Frame.ShowDetail := ShowDetailCredit;
      AnimateFloatDelay('Opacity', 1, Duration_Item, Delay_Item);
    end;
    aDataSet.Next;
  end;
  aDataSet.EnableControls;
end;

procedure TFrmCredits.FormShow(Sender: TObject);
begin
  LoadCredits;
end;

function TFrmCredits.IsDataCorrect: Boolean;
begin
  Result := False;
 // if dm.GS.IsNotEmpty(EdName.Text) then
 //   if dm.GS.IsFloat(EdBalance.Text) then
      Result := True;
end;

procedure TFrmCredits.LbSaveClick(Sender: TObject);
begin

end;

procedure TFrmCredits.LoadCredit(aID: string);
begin
  Self.ID := aID;
  with TCredit.Create(aID) do
    try
      EdPrice.Text := Price.ToString;

    finally
      Free;
    end;
end;

procedure TFrmCredits.LoadCredits;
var
  _sql, ID: string;
begin
  ID := '';
  _sql := Format(SQL_LOAD_Credits, [QuotedStr('%' + ID + '%')]);
  dm.DBCtrl.PrepareData(_sql, Credits);
  CreateItems(Credits, ListBox1);
end;

procedure TFrmCredits.NewCredit;
begin
  TabControl1.TabIndex := 1;
  LoadCredit('');
end;

procedure TFrmCredits.RecReturnClick(Sender: TObject);
begin
  TabControl1.TabIndex := 0;
end;

procedure TFrmCredits.RectSaveClick(Sender: TObject);
begin
  SaveCredit;
end;

procedure TFrmCredits.RoundRect1Click(Sender: TObject);
begin
  NewCredit;
end;

procedure TFrmCredits.SaveCredit;
begin
  with TCredit.Create(ID) do
    try
      Price :=  StrToFloat(EdPrice.Text);

      if Save then
      begin
        Self.ID := EmptyStr;
        dm.AlertMessage;
        TabControl1.TabIndex := 0;
        LoadCredits;
      end;
    finally
      Free;
    end;
end;

procedure TFrmCredits.ShowDetailCredit(aID: string);
begin
  TabControl1.TabIndex := 1;
  LoadCredit(aID);
end;

end.

	
	