require 'spec_helper'

describe NoteAttachment do
  describe "validations" do

    let(:max_note_attachment_size) { Chorus::Application.config.chorus['file_sizes_mb']['note_attachment'] }
    it { should belong_to :note }
    it { should validate_attachment_size(:contents).less_than(max_note_attachment_size.megabytes) }
  end
end