import os, string, re, time, fileinput, sys, shutil, urllib, datetime, subprocess, zipfile, glob, copy

_projet_name = 'ImplicitWait'
_current_dir = os.path.dirname(__file__) + '\\'
_rdf_path = _current_dir + r'install.rdf'

def main():
	
	last_modified_time = get_file_datetime(_rdf_path)
	current_version = find_in_file(_rdf_path, r'version>([.\d]+)<');
    
	print('')
	print('Project : ' + _projet_name)
	print('Tasks   : Build and package')
	print('Current Version  : ' + current_version)
	print('Last compilation : ' + (last_modified_time.strftime('%Y-%m-%d %H:%M:%S') if last_modified_time else 'none'))
	print('_______________________________________________________________________\n')
    
	new_version = get_new_version(current_version)
    
	print('New version : ' + new_version + '\n')
	print('** Update version number...')
	replace_in_file(_rdf_path, r'(?<=version>)[.\d]+(?=<)', new_version)
    
	print('** Build xpi ...')
	with ZipFile('selenium-implicit-wait-' + new_version + '.xpi', 'w') as zip:
		zip.add(r'chrome.manifest')
		zip.add(r'install.rdf')
		zip.add(r'chrome')
    
	print('\n__________________________________________________________END OF SCRIPT')
	

def get_file_datetime(filepath):
	return datetime.datetime.fromtimestamp(os.path.getmtime(filepath))

def find_in_file(filepath, pattern):
	with open(filepath, 'r') as f:
		result = re.search(pattern, f.read())
		return result.group(result.re.groups)

def replace_in_file(filepath, pattern, replacement):
	with open(filepath, 'r') as f:
		text = f.read()
	with open(filepath, 'w') as f:
		f.write(re.sub(pattern, replacement, text))

def get_input(message):
    try:
		return raw_input(message)
    except NameError:
		return input(message)

def get_new_version(version):
	new_version = ''
	matrix_add = {'s': [0,0,0], 'z':[0,0,1], 'y':[0,1,0], 'x':[1,0,0]}
	matrix_mul = {'s': [1,1,1], 'z':[1,1,1], 'y':[1,1,0], 'x':[1,0,0]}
	while new_version == '':
		input = get_input('Digit to increment [x.y.z] or version [0.0.0] or skip [s] ? ').strip()
		if re.match(r's|z|y|x', input) :
			add = matrix_add[input]
			mul = matrix_mul[input]
			values = [int(d) for d in version.split('.')]
			new_version = '.'.join( str( values[i] * mul[i] + add[i] ) for i in range(0,3))
		elif re.match(r'\d+\.\d+\.\d+', input):
			new_version = input
	return new_version
	
class ZipFile(zipfile.ZipFile):

	def __init__(self, file, mode):
		super(ZipFile, self).__init__(file, mode)
		
	def add(self, path):
		for item in glob.glob(path):
			if os.path.isdir(item):
				self.add(item + r'\*');
			else:
				self.write(item)
				
if __name__ == '__main__':
	main()