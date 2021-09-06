
Parent = {
    first = 0;
    second = 1;
};

Parent.new = function(self)
    local child = {}
    setmetatable(child, {__index = self});
    return child
end

Child = {};

setmetatable(Child, {__index = Parent});

print(Parent.first);
print(Parent.second);
print(Child.first);
print(Child.second);

print();
Parent.first = 5;
Child.second = 9;
print(Parent.first);
print(Parent.second);
print(Child.first);
print(Child.second);

print();
c = Parent:new();
print(c.first);
print(c.second);