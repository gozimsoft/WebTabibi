
	unit ClientsUnit;

interface

uses
  System.SysUtils, System.Types, System.UITypes, System.Classes,
  System.Variants,
  FMX.Types, FMX.Controls, FMX.Forms, FMX.Graphics, FMX.Dialogs, FMX.Layouts,
  FMX.ListBox, FMX.Controls.Presentation, FMX.StdCtrls, FireDAC.Stan.Intf,
  FireDAC.Stan.Option, FireDAC.Stan.Param, FireDAC.Stan.Error, FireDAC.DatS,
  FireDAC.Phys.Intf, FireDAC.DApt.Intf, Data.DB, FireDAC.Comp.DataSet,
  FireDAC.Comp.Client, ItemClientUnit, FMX.Objects, FMX.TabControl, FMX.Edit,
  FMX.DateTimeCtrls;

type
  TFrmClients = class(TForm)
    ListBox1: TListBox;
    RoundRect1: TRoundRect;
    Clients: TFDMemTable;
    ClientsID:TStringField ; 
ClientsName:TStringField ; 
ClientsAge:TIntegerField ; 
ClientsImg:TStringField ; 


    TabControl1: TTabControl;
    TabItem1: TTabItem;
    TabItem2: TTabItem;
    RectSave: TRectangle;
    LbSave: TLabel;
    Timer1: TTimer;
    VertScrollBox1: TVertScrollBox;
    BtnReturn: TButton;

    RecName : TRectangle; 
RecAge : TRectangle; 
RecImg : TRectangle; 

    EdName:TEdit ; 
EdAge:TEdit ; 
ImImg:TImage ; 


    procedure RoundRect1Click(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure RecReturnClick(Sender: TObject);
    procedure RectSaveClick(Sender: TObject);
    procedure LbSaveClick(Sender: TObject);
    procedure BtnReturnClick(Sender: TObject);
  private
    procedure NewClient;
    procedure CreateItems(aDataSet: TDataSet; aListBox: TListBox);
    procedure SaveClient;
    function IsDataCorrect: Boolean;
  public
    procedure ShowDetailClient(aID: string);
    procedure LoadClient(aID: string);
    procedure LoadClients;

  var
    ID: string;
    aColor_Item: TAlphaColor;

  const
    Height_Item = 35;
  end;

var
  FrmClients: TFrmClients;

implementation

{$R *.fmx} 
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}
uses FrameListBoxItem, DMUnit, Consts, ControllerClient, System.UIConsts;


procedure TFrmClients.BtnReturnClick(Sender: TObject);
begin
  TabControl1.TabIndex := 0;
end;

procedure TFrmClients.CreateItems(aDataSet: TDataSet; aListBox: TListBox);
begin
  aListBox.Clear;
  aDataSet.ControlsDisabled;
  while not aDataSet.Eof do
  begin
    with TFrameListBoxItem<TItemClient>.Create(aListBox) do
    begin
      Parent := aListBox;
      Height := Height_Item;
      Frame.ID := aDataSet.FieldByName('ID').AsString;
Frame.LbName.text := aDataSet.FieldByName('Name').AsString;
Frame.LbAge.text := aDataSet.FieldByName('Age').AsString;
Frame.LbImg.text := aDataSet.FieldByName('Img').AsString;

      Frame.LoadData := LoadClients;
      Frame.ShowDetail := ShowDetailClient;
      AnimateFloatDelay('Opacity', 1, Duration_Item, Delay_Item);
    end;
    aDataSet.Next;
  end;
  aDataSet.EnableControls;
end;

procedure TFrmClients.FormShow(Sender: TObject);
begin
  LoadClients;
end;

function TFrmClients.IsDataCorrect: Boolean;
begin
  Result := False;
 // if dm.GS.IsNotEmpty(EdName.Text) then
 //   if dm.GS.IsFloat(EdBalance.Text) then
      Result := True;
end;

procedure TFrmClients.LbSaveClick(Sender: TObject);
begin

end;

procedure TFrmClients.LoadClient(aID: string);
begin
  Self.ID := aID;
  with TClient.Create(aID) do
    try
      EdName.Text := Name;
EdAge.Text := Age.ToString;


    finally
      Free;
    end;
end;

procedure TFrmClients.LoadClients;
var
  _sql, ID: string;
begin
  ID := '';
  _sql := Format(SQL_LOAD_Clients, [QuotedStr('%' + ID + '%')]);
  dm.DBCtrl.PrepareData(_sql, Clients);
  CreateItems(Clients, ListBox1);
end;

procedure TFrmClients.NewClient;
begin
  TabControl1.TabIndex := 1;
  LoadClient('');
end;

procedure TFrmClients.RecReturnClick(Sender: TObject);
begin
  TabControl1.TabIndex := 0;
end;

procedure TFrmClients.RectSaveClick(Sender: TObject);
begin
  SaveClient;
end;

procedure TFrmClients.RoundRect1Click(Sender: TObject);
begin
  NewClient;
end;

procedure TFrmClients.SaveClient;
begin
  with TClient.Create(ID) do
    try
      Name :=  EdName.Text;
Age :=  StrToInt(EdAge.Text);


      if Save then
      begin
        Self.ID := EmptyStr;
        dm.AlertMessage;
        TabControl1.TabIndex := 0;
        LoadClients;
      end;
    finally
      Free;
    end;
end;

procedure TFrmClients.ShowDetailClient(aID: string);
begin
  TabControl1.TabIndex := 1;
  LoadClient(aID);
end;

end.

	
	