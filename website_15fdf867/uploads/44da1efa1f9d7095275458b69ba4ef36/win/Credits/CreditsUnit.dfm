
object FrmCredits: TFrmCredits
  Left = 0
  Top = 0
  BorderStyle = bsSizeable
  Caption = 'Credits'
  ClientHeight = 555
  ClientWidth = 867
  Color = clWhite
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  Position = poScreenCenter
  OnShow = FormShow
  PixelsPerInch = 96
  TextHeight = 13  
  object PanWinTitle: TPanel
    Left = 0
    Top = 0
    Width = 867
    Height = 50
    Align = alTop
    Color = 16769505
    ParentBackground = False
    TabOrder = 2
    ExplicitLeft = -8
    ExplicitTop = -2
    ExplicitWidth = 755
    object LbWinTitle: TLabel
      AlignWithMargins = True
      Left = 11
      Top = 4
      Width = 73
      Height = 42
      Margins.Left = 10
      Align = alLeft
      Caption = 'Alergies'
      Font.Charset = DEFAULT_CHARSET
      Font.Color = 4210816
      Font.Height = -19
      Font.Name = 'Tahoma'
      Font.Style = [fsBold]
      ParentFont = False
      ExplicitHeight = 36
    end
  end
  object SearchBox1: TSearchBox
    Left = 0
    Top = 50
    Width = 867
    Height = 26
    Margins.Top = 7
    Margins.Bottom = 7
    Align = alTop
    Alignment = taCenter
    Font.Charset = DEFAULT_CHARSET
    Font.Color = 6250335
    Font.Height = -15
    Font.Name = 'Tahoma'
    Font.Style = []
    ParentFont = False
    TabOrder = 3
    TextHint = 'Search'
    OnChange = SearchBox1Change
  end
  object cxGrid1: TcxGrid
    AlignWithMargins = True
    Left = 3
    Top = 53
    Width = 845
    Height = 460
    Align = alClient
    BevelInner = bvNone
    BorderStyle = cxcbsNone
    Font.Charset = DEFAULT_CHARSET
    Font.Color = clWindowText
    Font.Height = -16
    Font.Name = 'Tahoma'
    Font.Style = []
    ParentFont = False
    TabOrder = 0
    ExplicitLeft = -2
    ExplicitTop = 52
    object cxGrid1DBTableView3: TcxGridDBTableView
      Navigator.Buttons.CustomButtons = <>
      Navigator.Buttons.First.Visible = False
      Navigator.Buttons.PriorPage.Visible = False
      Navigator.Buttons.Prior.Visible = False
      Navigator.Buttons.Next.Visible = False
      Navigator.Buttons.NextPage.Visible = False
      Navigator.Buttons.Last.Visible = False
      Navigator.Buttons.Insert.Visible = False
      Navigator.Buttons.Append.Visible = False
      Navigator.Buttons.Delete.ImageIndex = 2
      Navigator.Buttons.Delete.Visible = True
      Navigator.Buttons.Edit.Visible = False
      Navigator.Buttons.Post.Visible = False
      Navigator.Buttons.Cancel.Visible = False
      Navigator.Buttons.Refresh.Visible = False
      Navigator.Buttons.SaveBookmark.Visible = False
      Navigator.Buttons.GotoBookmark.Visible = False
      Navigator.Buttons.Filter.Visible = False
      DataController.DataSource = DataSource1
      DataController.DetailKeyFieldNames = 'None selected'
      DataController.Options = [dcoAssignMasterDetailKeys,dcoSaveExpanding]
      DataController.Summary.DefaultGroupSummaryItems = <>
      DataController.Summary.FooterSummaryItems = <>
      DataController.Summary.SummaryGroups = <>
      EditForm.UseDefaultLayout = False
      NewItemRow.SeparatorColor = clInfoText
      OptionsCustomize.ColumnFiltering = False
      OptionsCustomize.ColumnsQuickCustomization = True
      OptionsCustomize.DataRowSizing = True
      OptionsData.CancelOnExit = False
      OptionsData.Deleting = False
      OptionsData.DeletingConfirmation = False
      OptionsData.Editing = False
      OptionsData.Inserting = False
      OptionsView.NoDataToDisplayInfoText = #1604#1575#1610#1608#1580#1583' '#1576#1610#1575#1606#1575#1578
      OptionsView.CellAutoHeight = True
      OptionsView.ColumnAutoWidth = True
      OptionsView.GroupByBox = False
      OptionsView.HeaderFilterButtonShowMode = fbmButton
      OptionsView.Indicator = True
      OptionsView.RowSeparatorColor = clWindow
      Preview.Place = ppTop
      object cxGrid1DBTableView3Num: TcxGridDBColumn
        DataBinding.FieldName = 'Num'
        HeaderAlignmentHorz = taCenter
        HeaderGlyphAlignmentHorz = taCenter
        LayoutItem = cxGrid1DBTableView3LayoutItem1.Owner
        Options.Editing = False
        Options.AutoWidthSizable = False
        Width = 120
      end
      
object cxGrid1DBTableView3Price: 
		TcxGridDBColumn
        Caption = 'Price'
        DataBinding.FieldName = 'Price'
        HeaderAlignmentHorz = taCenter
        HeaderGlyphAlignmentHorz = taCenter
        LayoutItem = 
		cxGrid1DBTableView3LayoutItem8.Owner
        Options.Editing = False
        Options.AutoWidthSizable = False
        Width = 120
      end



      object RootGroup: TcxGridInplaceEditFormGroup
        AlignHorz = ahLeft
        AlignVert = avTop
        ButtonOptions.Buttons = <>
        Hidden = True
        ItemIndex = 1
        LayoutDirection = ldHorizontal
        ShowBorder = False
        Index = -1
      end
      object cxGrid1DBTableView3Group1: TdxLayoutAutoCreatedGroup
        Parent = RootGroup
        AlignHorz = ahLeft
        AlignVert = avTop
        Index = 0
        AutoCreated = True
      end
      object cxGrid1DBTableView3Group2: TdxLayoutAutoCreatedGroup
        Parent = RootGroup
        AlignHorz = ahLeft
        AlignVert = avTop
        Index = 1
        AutoCreated = True
      end
      object cxGrid1DBTableView3LayoutItem8: TcxGridInplaceEditFormLayoutItem
        Parent = cxGrid1DBTableView3Group2.Owner
        AlignHorz = ahLeft
        AlignVert = avTop
        Index = 0
      end
    end
    object cxGrid1Level1: TcxGridLevel
      Caption = 'cxGrid1Level1'
      GridView = cxGrid1DBTableView3
    end
  end
    object PanBottom: TPanel
	Left = 0
    Top = 505
    Width = 867
    Height = 50
    Align = alBottom
    Color = clWhite
    Font.Charset = DEFAULT_CHARSET
    Font.Color = clWindowText
    Font.Height = -16
    Font.Name = 'Tahoma'
    Font.Style = []
    ParentFont = False
    TabOrder = 1
    ExplicitTop = 508
    object BtnAdd: TcxButton
      AlignWithMargins = True
      Left = 4
      Top = 4
      Width = 42
      Height = 42
      Align = alLeft
      OptionsImage.Glyph.SourceDPI = 120	  
      OptionsImage.Glyph.SourceHeight = 50
      OptionsImage.Glyph.SourceWidth = 50
      OptionsImage.Glyph.Data = {
        89504E470D0A1A0A0000000D49484452000000320000003208060000001E3F88
        B1000000097048597300000B1300000B1301009A9C180000012E49444154789C
        ED99514EC3301044F718500E819AA58780721EC26F114740AAD6F428850B1529
        EB363FFD2A72D3225461C5C1B459609EE43F5BDAC98CA524430400F81685F3B7
        2CFAC2A2353BDDF4BC56CD2C7EDC5144F56860F8CDD7AB7A4877221C906ACD52
        DD0D678B01F5CC70B618B0D3723B5398EDD9DFB41E62A7AF3BF5251983839866
        B679CAE655E3487D4EC6183DD56761B64274D9BA799F45320AA7CE07212782E1
        48263F1D55EECB11088900477241B422205AB9205A1110AD3F1D2D3EF2E72C41
        C827F0AEF51BEF48172024021CC905D18A8068E582684540B4ACC1F8D3680CFE
        778E14A2CBB0D142E576C8E5F4ED622744A98D6D7B6AB57A13BD4FAFDEC48F3F
        CA50A7A5C532F44AFC75D2C150011BAEA7279D9E42A8808385FB3BD3E72A9A19
        E6C94E0000E89077A82766E468D4DB140000000049454E44AE426082}
      TabOrder = 2
      OnClick = BtnAddClick
    end
    object BtnEdit: TcxButton
		AlignWithMargins = True
		Left = 52
		Top = 4
		Width = 42
		Height = 42
		Align = alLeft
		OptionsImage.Glyph.SourceDPI = 120
		OptionsImage.Glyph.SourceHeight = 50
		OptionsImage.Glyph.SourceWidth = 50
		OptionsImage.Glyph.Data = {
        89504E470D0A1A0A0000000D4948445200000060000000600806000000E29877
        38000000097048597300000B1300000B1301009A9C18000005B949444154789C
        ED9D4B881C4518C76B57F181F1098A1E04111FB8906CA6BE4913E3638D887852
        04230ADE0CF11E7C1CE720A241455696EC7E351BE373230B7A09A29844D8DDF8
        388847A3118D464C5CA3F37DB309BABEB6A566465C62D74C6FD2DD55D5537FA8
        DB6E75F5FF575D8FAFEBEB1122282828282828282828282828C84F6D9A8ECF00
        6CDC0C8A9F05A48F41D13C28FA0314C7560AF20F12F999A1E9F82C5166AD7FFE
        F0B980F478DB704B662B73D1104459058AEE93C8876D9B0C3D9E84FFB51B6923
        202B409E05C53312E9C5CA04578537AAC58380F414202D593758A507B061F2D8
        F980FC76F2DFD1925434E1FE90558B07A5A25DD68D55690B3DAD9B0DD8B81014
        7DD21B18ED761A42ABE75B3795573409A736DF75087ACCEF35EC48A4F7016973
        75B279FD9A578F9E67BDCDB842F35D85A0573BDD265C89F46565A271AB704870
        AAE6BB08A1BDD434367666F576BE587866BE447E0590DE731E426B936558E7EB
        9EEFA3F9A0F865BDA018D9199FE33C04A91AB77469DC46E19AF9A877E25D7ABE
        A25DBA53FDFB3FED899A76770746EF6A58766E4AF173A6095778DAF3C54972FA
        4900451F197AC5C3C2E39E7FB29C7D1200E9A7A4C6E8A5A6F0BCE77BF12400D2
        EF490D191A9B5F55582372ECF9CE3F09A6461472F182CD7712828B002047F39D
        83E01A0028C07CA720B8040052989F76C24D2BEB13B32B00C082F92B812091C6
        45590144A33F5F60CBFCD41074A41849960E40E480F9E921F00BA50210A5303F
        AB0937A389796F6900440EF5FCE5D2B0BBBC96FDA01400223FCDD7F3C098F700
        225FCDD7A5BE7093D700228FCD974853B95CBC28009136DF18FA76DEFCFDB91D
        42280240E4E06AE7BF33AFF45A8F767DA80F7DE5D688BC0144C17C7B00A260BE
        3D005130DF1E80F651179EF171C205C573B98EF94500A8D49B0F95C57C1D9A90
        8AB781A223B92486E40100148D96C17C2D6D78AE8921790090C89386F5F49415
        F391A64E75D8D1BD3E4D62886B4FC01BC96B6ABE5F78B6CECF7B999E0F00E4B7
        92EAAC62E36EE1D926CB4B0012E99DC47A91EF149EED70BD04A0E3E690506711
        39065987173C056008BAD539129EC576BC0420913F4B1E821AAB854DF391F6AF
        7493E5250040FA3CA9CEB5E3CD6B8547E67B0B40227F935467F5A55FAE141E99
        EF2F004547139F801D0B97FA64BEB700009992EACC32C85584F9DE029048BF25
        D539528BCFF4C97C3F01C4F14052C2B744FACB37F3BD04D03ADE975CE771DFCC
        F712C0F04EBA28B94E3AE69BF95E02583776E2F26473F8FBA44F24E84470C013
        575477F0D595FAC20DB2CE509968DE5845BEA332C17701F2A62AF203A600DFB2
        3297475E9B770086C7E9AA44008AFEEC64E4374C8981A7517231DF4B00BA1767
        6C6E5CF4B0E33580EA2455CA62BE970074BCA720007345E4327B07A0F30EF68B
        5CCD47DE575422B97700B4D68E3786F5A76E7A0E218A7F6D4DCA8A8E48E4AF41
        D10140FE549F23958AF7E81451503C0D486F0232EA2F2082E2078B7CB1EF2580
        96E278400F477A59B94E35AFD3CBCC35DB8F5FA6979DD78CC6670B4FE42F8092
        2800B0AC00C0B20200CB0A004A0FC0E10F36D9563BAF2D09002D667611D3272B
        5DF964994D99E25AFA9D776617311EA242DA2CFA5C80FC88290C92DD45F4AF62
        24EF52F7883E1720EF3378B32DC38BB47E9AC4102AA0DB459FAA8A8D11932FFA
        85516617EA04CF7E344C36075DFB7471115A5FE74B00E92BE3F89F752C4A2A7A
        AC4BE471563748F495F93C6B0E22D2D6CC2FDA39C9F05D978B1E843ADD264A2E
        68FDFE4C72CFEF9443B90512A5A27B53FC6ECC5E59E72D7A7956867DC2D0D8FC
        AACE41802DA60977D9AA700954E39E5C1B24919EEC01A06F8B545C13B92B8E07
        526414F65F417A5D7B933F800E0450FC0428FADBFA8D2BEBC62FB572820B4EAD
        5D3627F0B7D64D50D6CAA122B33A8DAB2389F4A8E9BC7F198B6CDD2B6D75EBB5
        692D1EAC627383DE82EBB338ED8D1B2DDA360B4EBBD06267133AA7EF4DDFA395
        E1262828282828282828282828284864A27F008861676A3484BCA40000000049
        454E44AE426082}
      TabOrder = 3
      OnClick = BtnEditClick
    end
    object BtnDelete: TcxButton
      AlignWithMargins = True
      Left = 100
      Top = 4
      Width = 42
      Height = 42
      Align = alLeft
      OptionsImage.Glyph.SourceDPI = 120
      OptionsImage.Glyph.SourceHeight = 50
      OptionsImage.Glyph.SourceWidth = 50
      OptionsImage.Glyph.Data = {
        89504E470D0A1A0A0000000D4948445200000020000000200806000000737A7A
        F4000000097048597300000B1300000B1301009A9C180000019449444154789C
        ED97BB4A03511086B7162F8D76BE826F101BB111538A29EC52ECFEFF09DB0A1A
        B14D5E206F11EDAC04C15AC85B8420063367450B2F4466B3458CD96493EC0685
        1D9866E7F69D99E12CC771FE9B086984BCB1E4EDB0EA37019869714B1E0AF061
        818625EB3F146844B683CC000438B7646B02604BC8B3858ABC542A3B96ACFD3A
        215917E05E80CE385B64EFA84F8CBDA6B9A70258A068C9074BF62D70373AEB99
        7590A31FE6048A89BA1000BB1AD476DD9585DAE9388EE6D05C9A337150900320
        1F01FEE612767D7F7B5AECA84F6A004FE5F29A90EF025CC4C5A94D7D1E8D594D
        1D40A567CC91DEF7425E3A231290A7427E8AE79D647A0FF4C640C415CF044045
        C85208A12D1FA802959C65DE843280F80A35A678B600884E1E7562A900C1D0CC
        272D662600C198859B04912A8090D5B090E71D8FC6E8B708A29A09C0B3EB6E58
        3218577C18427DBABEBF9E3AC0BC9203B4F311B8F32CA131050D1AFEADCE2B9A
        230430A6901CC0F7B7047813E02AEE11925485BCB6E46BE0BA9B33910BB96FC9
        E6C20F13B2D903F6E668DE72E41B470FBC128DBD2CF20000000049454E44AE42
        6082}
      TabOrder = 1
      OnClick = BtnDeleteClick
    end
    object BtnClose: TcxButton
      AlignWithMargins = True
      Left = 805
      Top = 4
      Width = 42
      Height = 42
      Align = alRight
      OptionsImage.Glyph.SourceDPI = 144
      OptionsImage.Glyph.SourceHeight = 50
      OptionsImage.Glyph.SourceWidth = 50
      OptionsImage.Glyph.Data = {
        89504E470D0A1A0A0000000D494844520000006400000064080600000070E295
        54000000097048597300000B1300000B1301009A9C180000036C49444154789C
        EDDDBD6ED4401405600B29E11942F61568E82840E24F44FC24BED77283685911
        414147199E8940434F882081969E0621A559306466250C335A855D13D0AC99B1
        0F9B732477EBB9D17C3BE35DE7C6C9B249EAB25CB6AA0F8DC8AE11F962556B1E
        7A34076E4E8CEA2B2BF2C0CD559632D5FAFA192BF296001AFA26DCAF45569260
        F895418CBAC59B71AF1E0E97A283B86D8A2B43DB6ECF9BD141DC3563A688C853
        B785452FF49FA72ACB55A3BA3D3D574675277A2123F279BA882B1CBDC882A412
        19344046D18B349761F4020B169B7ABE08325F08021682808520602108580802
        1682808520602108580802168280852060B1228F792F0B1825FEE0BCDBFB4F28
        F1072648EB18912759EC10042C04010B41C04210B010242C6663E3AC517D6144
        9E1B917359AA10242CD3CD84BE53A7282E64294290B058D50F332D40A9500812
        1693E7F79A7335E969BB98C50C41C263451E19D5EF8D66B96AAC7A295E117E53
        8F832272394E018260A110040C85206028044984521457DA0DC86B08160A41C0
        5008D2C9F794ABE18370CB4A8F22F23518852060280401432148E7D794C3B1C8
        CD3F9FC46B08160A41C05008D2334A9EDF9A7D21B72C2C1482407CFA3287AAB7
        215688298ABB46E453F3E7B027EC3022DFC6AAD77B05718F37729FCDFB9E0C0B
        72B8DB2CFD82ACAD9D763F44DF1361418EDE415C8CEA1DA3FAB1EFC9B07D6320
        6C5927F5A26E7F5F19BF3E69110408C3BF882BA45F8CE6B775820061F8177385
        748FE16EC38B5C3BFE0482748FF1B7DF89100408C39FC8158283E14F26481717
        F0F0CE13827480314F6F16418030FC40DCB2D261B469BA260810861F902B0407
        C30F4A101C0C3F30417030FCE00489F53D23CE5FE2120408C317E10A098AFBEF
        6CC7DC0EE18303FA88EF8E693463F0D11A3DA6DEDA3A65440E9263B870CB0ACB
        58F58615796F55DFD93C3F9FA50A41C04210B010042C04010B41DA870F5206C3
        48D27ACB15D21E83206018040148F21D855BD67C210858080216828085206021
        085808021682808520602108580872D2408CEA68BA402532885E644152890C1A
        4D72A3E8458CC86EA3C8765596ABD10B2D0086517DD698AB9D4E3AF27868D81C
        E4F9FDE82075592E5BD57D22E87C4FEF517DED3A1AA38378149115ABBA47140D
        7D94D21B376749308E5086C325ABBA69445E4E9A88B975E96C2FAF9B1BB74D25
        5B193F217E00C80B1A15F9BF9CFD0000000049454E44AE426082}
      TabOrder = 0      
	  OnClick = BtnCloseClick
    end
  end

  object DataSource1: TDataSource
    DataSet = Credits
    Left = 360
    Top = 192
  end
 

  object Credits: TFDMemTable
    OnCalcFields = CreditsCalcFields
    FieldDefs = <>
    IndexDefs = <>
    FetchOptions.AssignedValues = [evMode]
    FetchOptions.Mode = fmAll
    ResourceOptions.AssignedValues = [rvSilentMode]
    ResourceOptions.SilentMode = True
    UpdateOptions.AssignedValues = [uvCheckRequired,uvAutoCommitUpdates]
    UpdateOptions.CheckRequired = False
    UpdateOptions.AutoCommitUpdates = True
    StoreDefs = True
    Left = 355
    Top = 256
    
 object CreditsID: TStringField
      Alignment = taCenter
      FieldName = 'ID'
      
       Size = 255 

end


 object CreditsClient_id: TStringField
      Alignment = taCenter
      FieldName = 'Client_id'
      
       Size = 255 

end


 object CreditsPrice: TFloatField
      Alignment = taCenter
      FieldName = 'Price'
       DisplayFormat = '00.00' 

      
end


    object CreditsNum: TStringField
      Alignment = taCenter
      FieldKind = fkCalculated
      FieldName = 'Num'
      Calculated = True
    end
  end


end

